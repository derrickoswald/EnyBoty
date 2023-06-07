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

  A typical response:
  {
    "type": "ai",
    "data": {
        "content": "There are several types of batteries commonly used in household and commercial applications. \n\n1. Lead-acid batteries: These batteries are commonly used in cars, trucks, and other vehicles. They are affordable, reliable, and provide a consistent source of power.\n\n2. Lithium-ion batteries: These batteries are popular in portable electronic devices, like cell phones and laptops, due to their high energy density and longer lifespan.\n\n3. Nickel-cadmium batteries: These batteries are commonly used in power tools, cordless phones, and other devices that require high power output.\n\n4. Nickel-metal hydride batteries: These batteries are commonly used in hybrid and electric vehicles, as well as in rechargeable consumer electronics.\n\n5. Zinc-carbon batteries: These batteries are commonly used in low-drain devices, like remote controls and wall clocks, due to their low cost and reliability. \n\n6. Alkaline batteries: These batteries are commonly used in cameras, flashlights, and other high-drain devices due to their high energy density and longer lifespan compared to zinc-carbon batteries."
    }
  }

*/

const http = require('http');
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { HumanChatMessage, SystemChatMessage } = require("langchain/schema");

const hostname = 'localhost'; // '127.0.0.1';
const port = 80;

const chat = new ChatOpenAI({ temperature: 0.9 });

async function doit (prompt)
{
  const ret = await chat.call([
    new SystemChatMessage(
      "You are a friendly energy assistant that provides expert advice for questions about residential electrical consumption and cost savings."
    ),
    new HumanChatMessage(
      prompt
    ),
  ]
  //, { timeout: 60000 }
  );
  console.log(JSON.stringify (ret, null, 4));
  return (ret.text)
}

const server = http.createServer(async (request, response) =>
{
  if(request.method === "GET")
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
          parameters[fragments[0] = ''];
      })
    }
    if (parameters.prompt)
    {
      const value = doit (parameters.prompt)
      .then ((ret) =>
        {
          response.writeHead(200, {'Content-Type': 'text/html'});
          response.write('<!doctype html><html><head><title>response</title></head><body>');
          response.write(JSON.stringify (ret, null, 4));
          response.end('</body></html>');
        })
      .catch ((error) =>
        {
          console.error('Error:', error);
          response.writeHead(500, {'Content-Type': 'text/html'});
          response.write('<!doctype html><html><head><title>error response</title></head><body>');
          response.write('<pre>' + JSON.stringify (error, null, 4) + '</pre>');
          response.end('</body></html>');
        }
      )
    }
    else
    {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<!doctype html><html><head><title>error response</title></head><body>');
      response.write("I'm sorry. I don't know the answer to your question '" + JSON.stringify (parameters, null, 4) + "'");
      response.end('</body></html>');
    }
  }
  else
  {
    response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
    return response.end('<!doctype html><html><head><title>405</title></head><body>405: Method "' + request.method + '" Not Supported</body></html>');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
