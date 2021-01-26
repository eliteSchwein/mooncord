const config = require('../config.json');
const admin = false
const master = true
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var dcMessage
var requester
var executeReaction = (function(message,user,guild,emote,discordClient,websocketConnection){
    requester=user
    dcMessage=message
    wsConnection=websocketConnection
    if(emote.name=="❌"){
        message.delete()
        message.channel.send("<@"+user.id+"> You cancel the Print!")
        return
    }
    if(emote.name=="✅"){
        message.delete()
        websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "'+message.embeds[0].author.name+'"}, "id": '+id+'}')
        websocketConnection.on('message', handler);
        return
    }
})

function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    
    wsConnection.removeListener('message', handler)

}

module.exports = executeReaction;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}