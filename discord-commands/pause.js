const config = require('../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    channel.send("You found the template Command Module GG")
    var id = Math.floor(Math.random() * 10000) + 1
    websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.info", "id": '+id+'}')
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}