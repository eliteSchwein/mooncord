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
var invalidCommands = []
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
        invalidCommands=[]
        gcodeCommands=message.embeds[0].description.replace(/(\`)/g,"").split(" ")
        console.log(gcodeCommands)
        //websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "'+message.embeds[0].author.name+'"}, "id": '+id+'}')
        //websocketConnection.on('message', handler);
        var gcodeTimer=0
        var gcodePosition=0
        gcodeTimer=setInterval(()=>{
            if(gcodePosition==gcodeCommands.length){
                if(invalidCommands.length!=0){
                    var gcodeList = (invalidCommands.length+1)+" GCode Commands couldn't be executed:\n\n"
                    for(var i = 0; i<=invalidCommands.length-1;i++){
                        gcodeList=gcodeList.concat("`"+invalidCommands[i]+"` ")
                    }
                    const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Unknown GCode Commands')
                    .setDescription(gcodeList)
                    .attachFiles(__dirname+"/../execute.png")
                    .setThumbnail(url="attachment://execute.png")
                    .setTimestamp()
                    .setFooter(user.tag, user.avatarURL());
                
                    message.channel.send(exampleEmbed);
                }else{
                    message.channel.send("<@"+user.id+"> all GCodes Commands executed successfully!")
                }
                clearInterval(gcodeTimer)
                return
            }
            console.log("Execute Command ["+(gcodePosition+1)+"] "+gcodeCommands[gcodePosition])
            websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "'+gcodeCommands[gcodePosition]+'"}, "id": '+id+'}')
            websocketConnection.on('message', handler);
            gcodePosition++
        },500);
        message.delete()
        return
    }
})

function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    if(messageJson.method=="notify_gcode_response"){
        if(messageJson.params[0].includes("Unknown command")){
            var command = messageJson.params[0].replace("// Unknown command:","").replace(/\"/g,"")
            invalidCommands.push(command)
            wsConnection.removeListener('message', handler)
            return;
        }
    }
    console.log(messageJson)

    setTimeout(()=>{
        wsConnection.removeListener('message', handler)
    },1000)

}

module.exports = executeReaction;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}