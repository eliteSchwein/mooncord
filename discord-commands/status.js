const config = require('../config.json');
const command = "status"
const discordDatabase = require('../discorddatabase')
const websocketevents = require('../websocketevents')
var executeCommand = (function(command,channel,user,guild,discordClient){
    channel.startTyping();
    websocketevents.triggerStatusUpdate(discordClient,channel)
    channel.stopTyping();
})
module.exports = executeCommand;
module.exports.getCommand = function(){return command}