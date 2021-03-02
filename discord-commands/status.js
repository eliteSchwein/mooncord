const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
const variables = require('../utils/variablesUtil')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    channel.startTyping();
    variables.triggerStatusUpdate(discordClient,channel,guild,user)
    channel.stopTyping();
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}