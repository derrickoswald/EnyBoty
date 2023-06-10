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

![Smart Home Hub Plugin Whiteboard](/assets/whiteboard.jpg "whiteboard concept")

## Start Simple

![Smart Home Hub Plugin Architecture](/assets/architecture.svg "architecture diagram")

Various devices in the home are periodically sending messages to The Things Network (TTN).
This produces a time series of "measurements" or a body of "documents" depending on how you look at it.

The ChatBot is configured with an [API Chain](https://js.langchain.com/docs/modules/chains/other_chains/api_chain) which is a textual "paste" of the HTTP endpoint API specification and
a (templated) question that should produce a HTTP fetch of the data based on the text documentation (here there be magic).

Alternatively, all the documents could be fed into the ChatBot as an [Index Chain](https://js.langchain.com/docs/modules/chains/index_related_chains/document_qa) and then queried via a suitable question.

The end result should allow a user to interact with a ChatBot and request information about the IoT
devices in their home.

### Evaluation

The use of the [API Chain](https://js.langchain.com/docs/modules/chains/other_chains/api_chain) method is problematic for three reasons:

1. The text needed to describe the TTN API that would fetch IoT data is fairly large, which is what you pay for with the [OpenAI revenue model](https://openai.com/pricing). For the stupid example code we used, the breakdown is 897 prompt + 65 completion = 962 tokens or about 0.2&cent; per call (or up to 30 times that for the GPT-4 model). The Things Stack is just gnarly and complex. The specification of the API via text, as could be scraped from the [overview](https://www.thethingsindustries.com/docs/the-things-stack/interact/api/) and [The Things Stack API Reference](https://www.thethingsindustries.com/docs/reference/api/) includes many subtleties regarding authentication headers, field codes, JSON message bodies, etc. so that the entire textual description of the API could be on the order of tens of thousand of tokens, which makes the cost prohibitive.

2. The use of the TTN API to fetch IoT data required enabling the [storage integration](https://www.thethingsindustries.com/docs/reference/api/storage_integration/), which means The Things Network is the point of storage for the data. This is not correct usage really, since the intent is just to transmit IoT messages as a pipeline.

3. The use of the OpenAI ChatBot mechanism to do the low level fetching of IoT data is an impedance mismatch. That is it's using a sledge hammer to do the job of a scalpel. It is an illustrated case of the adage "When you have a hammer, everything looks like a nail."

## Architecture 2

![econd Smart Home Hub Plugin Architecture](/assets/architecture2.svg "second architecture diagram")

We add a bash scripting integrator program to read from The Things Network and send to the ChatBot as a message:

    "Please remember this IoT JSON from my device:" + json

### Evaluation

The initial few messages from the IoT are accepted by the ChatBot and one can ask questions about them using the 
initial client interface. However, after the first few messages, the process fails.

We ran out of time.

