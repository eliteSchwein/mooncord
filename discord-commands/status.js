const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
const websocketevents = require('../websocketevents')
var executeCommand = (function(command,channel,user,guild,discordClient){
    channel.startTyping();
    websocketevents.triggerStatusUpdate(discordClient,channel)
    channel.stopTyping();
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}