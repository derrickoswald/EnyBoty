# EnyBoty (energy-assistant)

[Make Zurich challenge](https://makezurich.ch/start/3/) "Develop a chatbot that draws attention, is fun to use, and helps to save energy."

## Use-Cases

There are two different uses-cases outlined in the presentation:

---

### Advice from a Website Use-case

![Advisor Chatbot](/assets/advice-use-case.png "Advise from a web site use-case")

    As a user of the ewz web site,
    I want to have access to an energy assistant chat-bot, 
    so that I can get relevant answers to my questions outside of office hours.

---

### Smart Home Hub Plugin Use-case

![Expert Chatbot](/assets/smart-controller-module.png "Smart Hub plug-in use-case")

    As a sophisticated user of smart home hubs and devices,
    I want to be able to incorporate a smart home energy assistant, 
    so that I can optimize my control and cost saving strategies.

---

## Advice from a Website Interaction Diagram

![Advisor Chatbot Interaction](/assets/advice-interaction-diagram.jpg "Advice from a web site interaction diagram")


- On [ewz site page load](https://www.ewz.ch/de/private/strom/strom-sparen/energiespartipps.html)
a [UserScript](https://en.wikipedia.org/wiki/Userscript) runs in the browser to augment the **Beratung** section with a chatbot button.
- The user clicks the button, which opens a form in the lower right corner of the browser window.
- The user enters text into the form prompt area and clicks submit.
- Javascript attached to the form performs a [Cross Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
to a [Node.js server](https://nodejs.org/en/about) that has been pre-configured with [Large Language Model (LLM) prompts](https://platform.openai.com/examples/default-factual-answering?lang=node.js) to be an energy assistant.
- The Node.js server submits a formatted Chat Completions API request to OpenAI.
- The result is unpacked by the Node.js server and returned as the result of the XMLHttpRequest to the browser client.
- Javascript on the client browser displays the result text and loops to request the next prompt.

For the "Advice from a Website" use-case, the current status is a proof of concept:
- a basic userscript that sends a prompt to the back-end server
- a back-end server component that can interact with the OpenAI chat model using the Langchain framework
- a preliminary set of prompts to make the OpenAPI chatGPT software into an energy assistant

Here is the link to the [raw userscript](https://github.com/derrickoswald/energy-assistant/raw/main/client/Energy%20Assistant.user.js)
from github (otherwise it's a piece of shit web display of the actual file)
that you would need to install in Tampermonkey or Greasemonkey in your browser
**in addition to a locally running server component (hardcoded localhost)**.


## Smart Home Hub Plugin Whiteboard

![Smart Home Hub Plugin Whiteboard](/assets/whiteboard.jpg "whiteboard diagram")
