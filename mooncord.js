"use strict";
const si = require('systeminformation');
const websocketevents = require('./websocketevents')
const discordevents = require('./discord-events/index')
const discordDataBase = require('./discorddatabase')
const WebSocketClient = require('websocket').client;
const pjson = require('./package.json');
const config = require('./config.json');
const Discord = require('discord.js');
const discordClient = new Discord.Client();

console.log("\n"+
"    __  __                    ____              _ \n"+
"   |  \\/  | ___   ___  _ __  / ___|___  _ __ __| |\n"+
"   | |\\/| |/ _ \\ / _ \\| '_ \\| |   / _ \\| '__/ _` |\n"+
"   | |  | | (_) | (_) | | | | |__| (_) | | | (_| |\n"+
"   |_|  |_|\\___/ \\___/|_| |_|\\____\\___/|_|  \\__,_|\n"+
"                                                  \n"+
"Version: "+pjson.version+"\n"+
"Author: "+pjson.author+"\n"+
"Homepage: "+pjson.homepage+"\n")

var client = new WebSocketClient();

console.log("Connect Websocket...\n")

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('close', function() {
        console.log('WebSocket Connection Closed');
    });
});

client.connect('ws://'+config.moonrakersocketurl);

console.log("Enable Websocket Events...\n")

websocketevents(client,discordClient)

console.log("Connect Discord Bot...\n")

discordClient.login(config.bottoken)

discordClient.on('ready', () => {
    console.log("Discordbot Connected");
    console.log("Name: "+discordClient.user.tag)
    console.log("Invite: https://discord.com/oauth2/authorize?client_id="+discordClient.user.id+"&scope=bot&permissions=336063568")
    discordClient.user.setActivity("Starting...",{type: "COMPETING"})
});

console.log("Enable Discord Events...\n")

discordevents(discordClient)