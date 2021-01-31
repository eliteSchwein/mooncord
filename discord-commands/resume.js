const config = require('../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
var variables = require("../websocketevents")
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    if(variables.getStatus()!="pause"){
        channel.send("<@"+user.id+"> the Printer isn`t currently Pausing!")
        return;
    }
    channel.send("<@"+user.id+"> you resume the Print!")
    var id = Math.floor(Math.random() * 10000) + 1
    websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.print.resume", "id": '+id+'}')
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}