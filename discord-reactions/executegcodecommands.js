const config = require('../config.json');
const admin = false
const master = true
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var variables = require("../websocketevents")
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var dcMessage
var requester
var executeReaction = (function(message,user,guild,emote,discordClient,websocketConnection){
    requester=user
    dcMessage=message
    wsConnection=websocketConnection
    if(variables.getStatus()!="ready"){
        channel.send("<@"+user.id+"> the Printer is not ready!")
        message.delete()
        return;
    }
    if(emote.name=="❌"){
        message.channel.send("<@"+user.id+"> You cancel the GCode executions!")
        message.delete()
        return
    }
    if(emote.name=="✅"){
        message.channel.send("<@"+user.id+"> The GCodes will be send to Moonraker!")
        var gcodeCommands = []
        gcodeCommands=message.embeds[0].description.replace(/(\`)/g,"").split(" ")
        console.log(gcodeCommands)
        //websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "'+message.embeds[0].author.name+'"}, "id": '+id+'}')
        //websocketConnection.on('message', handler);
        message.delete()
        var gcodeTimer=0
        var gcodePosition=0
        gcodeTimer=setInterval(()=>{
            if(gcodePosition>gcodeCommands.length){
                clearInterval(gcodeTimer)
            }
            websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "'+gcodeCommands[gcodePosition]+'"}, "id": '+id+'}')
            websocketConnection.on('message', handler);
            gcodePosition++
        },500);
        return
    }
})

function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    console.log(messageJson)
    wsConnection.removeListener('message', handler)

}

module.exports = executeReaction;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}