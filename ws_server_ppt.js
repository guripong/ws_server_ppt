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

function save_client_information(ws, ip, isnew) {

  var returnid = -1;
  for (var i = 0; i < id_count; i++) {
    if (id_client[i]['ip'] == ip) {
      isnew[0] = 0;
      returnid = i;
      break;
    }
  }


  if (returnid == -1) { //새롭게 추가해야함
    returnid = id_count;
    id_client[id_count] = {};
    id_client[id_count]['ws'] = ws;
    id_client[id_count]['ip'] = ip;
    id_count++;
  }

  return returnid;
}

wss.on('connection', function connection(ws, req) {
  ws.on('message', function incoming(data) {

    // Broadcast to everyone else.

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        if (data != 'PING') {
          var ip = req.connection.remoteAddress;
          if (!ip) ip = req.headers['x-forwarded-for'].split(/\s*,\s*/)[0];

          var isnew = [];
          isnew[0] = 1;
          var id = save_client_information(ws, ip, isnew);

          if (isnew[0] == 0) {
            console.log(`[it's not new client!] [ip:`, id_client[id]['ip'], `] [id:`, id), `]`;
          }
          else {
            console.log(`[new client!] [ip:`, id_client[id]['ip'], `] [id:`, id, `]`);
          }
          console.log('ip:', ip, '->received:', data);
        }

        client.send(data); //전부다한테 보냄
      }
    }.bind(client));

  });//message
}); //connection


setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(new Date().toTimeString());
  });
}, 5000);