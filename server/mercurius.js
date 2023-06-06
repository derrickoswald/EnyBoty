/*
  Messenger between client side Javascript and OpenAI API.

  You will need an OpenAPI secret key in environment variable OPENAI_API_KEY

  Run as root to be able to use port 80:

  cd server
   export OPENAI_API_KEY="your secret key"
  npm install -S langchain
  sudo -E /home/derrick/.nvm/versions/node/v18.16.0/bin/node mercurius.js

  A typical request: localhost?prompt=What%20types%20of%20batteries%20are%20there

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
      "You are an energy assistant that provides expert advice for questions about electrical consumption and cost savings."
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
      const value = await doit (parameters.prompt);
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<!doctype html><html><head><title>response</title></head><body>');
      response.write(JSON.stringify (value, null, 4));
      response.end('</body></html>');
    }
    else
    {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write('<!doctype html><html><head><title>response</title></head><body>');
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
