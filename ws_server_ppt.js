'use strict';

const express = require('express');
const WebSocket = require('ws');
const SocketServer = WebSocket.Server;

const PORT = process.env.PORT || 15234;

const server = express()
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new SocketServer({ server });

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

var id_count = 0;
var id_client = [];

function save_client_information(ws, ip) {

  var returnid = -1;
  for (var i = 0; i < id_count; i++) {
    if (id_client[i]['ip'] == ip) {
      
      returnid = i;
      console.log(`[it's not new client!] [ip:`, id_client[i]['ip'], `] [id:`, i), `]`;
      break;
    }
  }


  if (returnid == -1) { //새롭게 추가해야함
    returnid = id_count;
    id_client[id_count] = {};
    id_client[id_count]['ws'] = ws;
    id_client[id_count]['ip'] = ip;
    id_count++;
    console.log(`[new client!] [ip:`, id_client[returnid]['ip'], `] [id:`, returnid, `]`);
  }

  return returnid;
}

wss.on('connection', function connection(ws, req) {

  ws.on('message', function incoming(data) {
    var ip = req.connection.remoteAddress;
    if (!ip) ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];
    

    // Broadcast to everyone else.
    if (data != 'PING') {
      var id = save_client_information(ws, ip);
      console.log('ip:', ip, '->received:', data);
    }else{
      console.log('ip:', ip, '->received:PING');
    }
    

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data); //전부다한테 보냄
      }
    });

  });//message

  
}); //connection


setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 5000);