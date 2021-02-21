const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var variables = require("../websocketevents")
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    channel.send(variables.getStatus())
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}