"use strict";
var express = require('express');
var cors = require('cors')
var si = require('systeminformation');
var modules = require('./modules/index')

var app = express();

app.use(cors())

const PORT = 8082;

app.listen(PORT, () => {
    console.log(`Started listening on port `+PORT);
});

modules(app)

app.get('/', function (req, res) {
	res.type("application/json");
	res.send('{"status":"ok"}');
});