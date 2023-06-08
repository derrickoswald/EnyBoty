// ==UserScript==
// @name         Energy Assistant
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Add an energy assistant chatbot to the ewz.ch web site.
// @author       Derrick Oswald
// @match        https://www.ewz.ch/de/private/strom/strom-sparen/energiespartipps.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ewz.ch
// @grant        none
// ==/UserScript==

// This script adds the Chatbot option to the "Beratung" section of the Energie Spar Tipps web page of Elektrizitätswerk der Stadt Zürich (ewz.ch).
// There is a whole shit show of trackers and ad domains coming from this page.
// You should block these with Privacy Badger (https://www.eff.org/pages/privacy-badger) and uBlock Origin (https://ublockorigin.com/).
// To install this user script in your browser, you will need a user script browser extension like Tamper Monkey (https://www.tampermonkey.net/) or Greasemonkey.
// Then (basically import it) with "Utilities" "Import from file".
// You will also need a server running, so see the notes in ../server/mercurius.js and alter localhost below if necessary.

(function() {
    'use strict';
    (
        function initialize ()
        {
            const server = "http://localhost";
            console.log ("initializing Energy Assistant chatbot to server at " + server);

            /**
             * @summary Browser independent CORS setup.
             * @description Creates the CORS request and opens it.
             * @param {string} method The method type, e.g. "GET" or "POST"
             * @param {string} url the URL to open the request on
             * @param {boolean} [asynchronous = true] optional parameter for open() call, default <em>true</em>
             * @param {boolean} [withcredentials = false] optional parameter for XMLHttpRequest, default <em>false</em>
             * @returns {object} the request object or <code>null</code> if CORS isn't supported
             */
            function createCORSRequest (method, url, asynchronous, withcredentials)
            {
                let ret;

                if ("undefined" == typeof (asynchronous))
                    asynchronous = true;
                if ("undefined" == typeof (withcredentials))
                    withcredentials = false;
                ret = new XMLHttpRequest ();
                if ("withCredentials" in ret) // "withCredentials" only exists on XMLHTTPRequest2 objects
                {
                    ret.open (method, url, asynchronous);
                    if (withcredentials)
                        ret.withCredentials = true;
                }
                else if (typeof XDomainRequest != "undefined") // IE
                {
                    ret = new XDomainRequest ();
                    ret.open (method, url);
                }
                else
                    ret = null; // CORS is not supported by the browser

                return (ret);
            }

            /**
             * @typedef Problem
             * @property status {int} XMLHttpRequest status
             * @property statusText {string} XMLHttpRequest status text
             */

            /**
             * Promisify native XHR using CORS.
             *
             * @param method HTTP verb: GET, PUT, POST, PATCH or DELETE
             * @param url the URL to fetch
             * @param data the data to send if POST or PATCH
             * @param preflight function to manipulate the XMLHttpRequest prior to sending
             * @returns {Promise<XMLHttpRequest|Problem>} to resolve with the XMLHttpRequest or reject with a problem
             */
            function makeRequest (method, url, data, preflight)
            {
                return (
                    new Promise (
                        function (resolve, reject)
                        {
                            const xmlhttp = createCORSRequest (method, url);
                            if ("function" == typeof (preflight))
                                preflight (xmlhttp);
                            xmlhttp.onload = function ()
                            {
                                if ((xmlhttp.status >= 200) && (xmlhttp.status < 300))
                                    resolve (xmlhttp);
                                else
                                    reject ({ "status": xmlhttp.status, "statusText": xmlhttp.statusText });
                            };
                            xmlhttp.onerror = () => reject ({ "status": xmlhttp.status, "statusText": xmlhttp.statusText });
                            xmlhttp.send (data);
                        }
                    )
                );
            }

            // send prompt to the server and update the history with the results
            function sendPrompt (event)
            {
                const prompt = document.getElementById ("prompt").value;
                console.log (prompt);
                const history = document.getElementById ("chat_history");
                history.innerHTML = history.innerHTML + prompt + "\n";

                const url = server + "?json&prompt=" + encodeURIComponent(prompt);

                makeRequest ("GET", url).then (
                    (xmlhttp) =>
                    {
                        const answer = xmlhttp.response;
                        console.log (answer);
                        history.innerHTML = history.innerHTML + answer + "\n";
                    }
                )
                .catch(error => alert(JSON.stringify (error, null, 4)));
            }

            // set up a chatbot window
            function addWindow (event)
            {
                const template =
                      `
    <div style='height: 100%; border: 2px solid #003763; border-radius: 4px; background-color: white; padding: 10px;'>
        <div style='width: 200px; padding-left: 20px; color: #004f8b;'>Energy Assistant</div>
        <pre id='chat_history' style='max-width: 450px; min-width: 100px; overflow-x: auto; max-height: 400px; overflow-y: scroll; border: 5px solid #e3edf9; padding: 1em; margin-bottom: 1em'></pre>
        <input id="prompt" name="prompt" type="text" size="40">
        <button id='submit_prompt' type='button' style='float: right; margin-left: 5px;; margin-top: 9px;'>Submit</button>
    </div>
`;
                const div = document.createElement ("div");
                div.setAttribute ("style", "position: fixed; bottom: 100px; right: 20px; z-index: 100;");
                div.innerHTML = template;
                document.getElementsByTagName ("body")[0].appendChild (div);
                document.getElementById ("submit_prompt").onclick = function(event) {
                    sendPrompt (event);
                    return (false);
                }
            }

            // set up a chartbot link button
            function addLink (event)
            {
                const dt = document.createElement ("dt");
                dt.classList.add ("contactteaser__data-label");
                dt.innerHTML = "Chatbot";

                const link = document.createElement ("a");
                link.classList.add ("contactteaser__link");
                link.classList.add ("link-external");
                link.innerHTML = "Start a conversation";

                const dd = document.createElement ("dd");
                dd.classList.add ("contactteaser__data-cell");
                dd.appendChild (link);

                const beratung = document.getElementsByClassName ("contactteaser__data")[0];
                beratung.appendChild (dt);
                beratung.appendChild (dd);

                // the code to run when the link is clicked
                link.onclick = function(event) {
                    addWindow (event);
                    return (false);
                }
            }

            // set up a callback when the document is loaded
            window.addEventListener("load", addLink);

            console.log ("finished initializing Energy Assistant chatbot");
        }
    )();
})();
