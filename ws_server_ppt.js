'use strict';

const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;

const PORT = process.env.PORT || 15234;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

var id_count=0;
var id_client=[];

function save_client_information(ws,ip)
{
  var isneedsave=1;
  for(var i = 0 ; i<id_client.length ; i++)
  {
    if(id_client[i]['ws']==ws)
    {
      isneedsave=0;
      break;
    }
  }
  if(isneedsave==0){
    id_client[id_count]={};
    id_client[id_count]['ws']=ws;
    id_client[id_count]['ip']=ip;
    id_count++;
    return 1;
  }
  else{
    return 0;
  }
}

wss.on('connection', function connection(ws,req) {
  var ip=req.connection.remoteAddress;
  if(!ip)ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
  

  if(save_client_information(ws,ip)==0)
  {
    console.log(`it's not new client`);
  }
  else{
    console.log(`new client!`);
  }

  

  ws.on('message', function incoming(data) {
   
    if(data!='PING')
    {
         console.log('ip:',ip,'->received:', data);
                 

    }
    else{
         console.log('##PING by local!##');
    }

    // Broadcast to everyone else.
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });

  });






});


setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 5000);