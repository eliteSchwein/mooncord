"use strict";
var express = require('express');
var cors = require('cors')
var si = require('systeminformation');
var modules = require('./modules/index');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

var app = express();

app.use(cors())

const PORT = 8082;

app.listen(PORT, () => {
    console.log(`Started listening on port `+PORT);
});

modules(app,client)

app.get('/', function (req, res) {
	res.type("application/json");
	res.send('{"status":"ok"}');
});

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('close', function() {
        console.log('WebSocket Connection Closed');
    });
});

client.connect('ws://192.168.14.128:81/websocket');