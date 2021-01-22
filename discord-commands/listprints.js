const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var dcChannel
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    wsConnection=websocketConnection
    dcChannel=channel
    channel.send("You found the template Command Module GG")
    channel.startTyping();
    websocketConnection.send('{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": '+id+'}')
    
    websocketConnection.on('message', handler);
    channel.stopTyping();
})

function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    console.log(messageJson.result)
    wsConnection.removeListener('message', handler)

}
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}