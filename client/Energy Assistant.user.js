// ==UserScript==
// @name         Energy Assistant
// @namespace    http://tampermonkey.net/
// @version      0.2
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

(function() {
    'use strict';
    (
        function initialize ()
        {
            console.log ("initializing Energy Assistant chatbot");

            // send prompt to the server and update the history with the results
            // note: currently this is a stub
            function sendPrompt (event)
            {
                const prompt = document.getElementById ("prompt").value;
                console.log("faking sending a prompt '" + prompt + "' to the server");
                const current = document.getElementById ("chat_history").innerHTML;
                document.getElementById ("chat_history").innerHTML = current + prompt + "\n" ;
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
