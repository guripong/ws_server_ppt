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
      console.log(`[it's not new client!] [ip:`, id_client[i]['ip'], `] [id:`, i, `]`);
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
var lambdaip=`::ffff:52.71.221.159`;
var lambdaws=``;

wss.on('connection', function connection(ws, req) {

  ws.on('message', function incoming(data) {
    var ip = '0';
    ip=req.connection.remoteAddress;
    if(ip==lambdaip){
      lambdaws=ws;
    }
    var id = save_client_information(ws, ip);

    // Broadcast to everyone else.
    if(data.indexOf('PING')!==-1){
      console.log('ip:', ip, '->received:PING');
    }
    else if(data.indexOf('answer')!==-1){ //answer 포함

      if(data.indexOf('f_open')!==-1){ //fail 포함
        console.log(`local has not pptx file.`);
        //ws.send('find pptx file!');
        lambdaws.send('find pptx file please!');
      }
      else if(data.indexOf('f_close')!==-1){
        console.log(`local fail to close pptx file.`);
        lambdaws.send('fail to close pptx file.');
      }
      else if(data.indexOf('s_close')!==-1){
        console.log(`local success to close pptx file.`);
        lambdaws.send('success to close pptx file.');
      }
      else{
        console.log(`local has opended [`,data.split(':')[1],`] file.`);
        lambdaws.send(`local has opended [`,data.split(':')[1],`] file.`);
      }
      
    }else{ //PING 포함
      console.log('ip:', ip, '->received:', data);
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