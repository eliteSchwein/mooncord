const config = require('../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const websocketevents = require('../websocketevents')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" Status")
        return;
    }
    var oldstatus=websocketevents.getStatus()
    channel.startTyping();
    websocketevents.updateStatus(args[0])
    websocketevents.triggerStatusUpdate(discordClient,channel,guild,user)
    websocketevents.updateStatus(oldstatus)
    channel.stopTyping();
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}