/*
  Messenger between client side Javascript and OpenAI API.

  You will need an OpenAPI secret key in environment variable OPENAI_API_KEY.
  You'll need a modern node.js installation (i.e. >= 18.xxx).
  Run as root to be able to use port 80:

  cd server
   export OPENAI_API_KEY="your secret key"
  export NODE_BIN=$(which node)
  $NODE_BIN --version
  npm install --save langchain
  sudo --preserve-env $NODE_BIN mercurius.js

  A typical request: localhost?prompt=What%20types%20of%20batteries%20are%20there

  A typical response (costs $US0.00050):
  {
    "type": "ai",
    "data": {
        "content": "There are several types of batteries commonly used in household and commercial applications. \n\n1. Lead-acid batteries: These batteries are commonly used in cars, trucks, and other vehicles. They are affordable, reliable, and provide a consistent source of power.\n\n2. Lithium-ion batteries: These batteries are popular in portable electronic devices, like cell phones and laptops, due to their high energy density and longer lifespan.\n\n3. Nickel-cadmium batteries: These batteries are commonly used in power tools, cordless phones, and other devices that require high power output.\n\n4. Nickel-metal hydride batteries: These batteries are commonly used in hybrid and electric vehicles, as well as in rechargeable consumer electronics.\n\n5. Zinc-carbon batteries: These batteries are commonly used in low-drain devices, like remote controls and wall clocks, due to their low cost and reliability. \n\n6. Alkaline batteries: These batteries are commonly used in cameras, flashlights, and other high-drain devices due to their high energy density and longer lifespan compared to zinc-carbon batteries."
    }
  }

  or localhost?prompt=Welche%20Batteriearten%20gibt%20es responds
  {
    "type": "ai",
    "data": {
        "content": "Es gibt verschiedene Arten von Batterien. Hier sind einige der häufigsten:\n\n1. Alkaline-Batterien: Sie sind die am häufigsten verwendeten Batterien und werden in vielen Geräten wie Fernbedienungen, Taschenlampen, Spielzeugen und Uhren verwendet.\n\n2. Lithium-Ionen-Batterien: Diese Batterien werden in Smartphones, Laptops, Kameras und anderen elektronischen Geräten verwendet. Sie sind leistungsstärker als Alkaline-Batterien, haben jedoch eine kürzere Lebensdauer.\n\n3. Blei-Säure-Batterien: Diese werden in Autos, Motorrädern, Golfwagen und anderen Fahrzeugen verwendet. Sie sind schwerer und größer als andere Batterietypen, aber sie sind auch leistungsstärker.\n\n4. Nickel-Cadmium-Batterien: Sie werden in älteren Mobiltelefonen, Spielzeugen und Werkzeugen verwendet. Sie haben eine längere Lebensdauer als Alkaline-Batterien, sind jedoch giftig und umweltschädlich.\n\n5. Nickel-Metallhydrid-Batterien: Diese werden in Hybridfahrzeugen, elektronischen Geräten und Werkzeugen verwendet. Sie sind leistungsstärker und umweltfreundlicher als Nickel-Cadmium-Batterien, haben aber immer noch eine begrenzte Lebensdauer."
    }
  }

  */

const http = require("http");
const { ConversationChain } = require("langchain/chains");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { BufferMemory } = require("langchain/memory");
const {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
  MessagesPlaceholder,
} = require ("langchain/prompts");

const hostname = 'localhost'; // '127.0.0.1';
const port = 80;

const chat = new ChatOpenAI({ temperature: 0.9 });

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "The following is a friendly conversation between a human and a friendly energy assistant AI that provides expert advice for questions about residential electrical consumption and cost savings. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know."
  ),
  new MessagesPlaceholder("history"),
  HumanMessagePromptTemplate.fromTemplate("{input}"),
]);

const chain = new ConversationChain({
  memory: new BufferMemory({ returnMessages: true, memoryKey: "history" }),
  prompt: chatPrompt,
  llm: chat,
});

async function doit (prompt)
{
  const ret = await chain.call({ input: prompt } );
  console.log(JSON.stringify (ret, null, 4));
  return (ret.response)
}

const server = http.createServer(async (request, response) =>
{
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET',
    'Access-Control-Max-Age': 2592000, // 30 days
  };

  if(request.method === "OPTIONS")
  {
    response.writeHead(204, headers);
    response.end();
  }
  else if(request.method === "GET")
  {
    let parameters = {};
    let query = request.url.split('?');
    if (query.length >= 2)
    {
      query[1].split('&').forEach((item)=>
      {
        const fragments = item.split ('=');
        if (fragments.length >= 2)
          parameters[fragments[0]] = decodeURIComponent(fragments[1]);
        else
          parameters[fragments[0]] = '';
      })
    }
    console.log(JSON.stringify (parameters, null, 4));
    const json = parameters.hasOwnProperty("json");
    if (parameters.prompt)
    {
      const value = doit (parameters.prompt)
      .then ((ret) =>
        {
          if (json)
          {
            response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
            response.end(ret);
          }
          else
          {
            response.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            response.write('<!doctype html><html><head><title>response</title></head><body>');
            response.write('<pre>' + ret + '</pre>');
            response.end('</body></html>');
          }
        })
      .catch ((error) =>
        {
          if (json)
          {
            response.writeHead(500, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
            response.end(JSON.stringify (error, null, 4));
          }
          else
          {
            console.error('Error:', error);
            response.writeHead(500, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'});
            response.write('<!doctype html><html><head><title>error response</title></head><body>');
            response.write('<pre>' + JSON.stringify (error, null, 4) + '</pre>');
            response.end('</body></html>');
          }
        }
      )
    }
    else
    {
      if (json)
      {
        response.writeHead(400, {'Content-Type': 'application/json'});
        response.end(query[1]);
      }
      else
      {
        response.writeHead(400, {'Content-Type': 'text/html'});
        response.write('<!doctype html><html><head><title>error response</title></head><body>');
        response.write("I'm sorry. I don't know the answer to your question '" + query[1] + "'");
        response.end('</body></html>');
      }
    }
  }
  else
  {
    response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
    response.end('<!doctype html><html><head><title>405</title></head><body>405: Method "' + request.method + '" Not Supported</body></html>');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
