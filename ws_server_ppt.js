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

wss.on('connection', function connection(ws,req) {
  var ip=req.connection.remoteAddress;
  if(!ip)ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
  console.log(`ws.id:`,ws.id);

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