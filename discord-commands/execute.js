const config = require('../config.json');
const admin = false
const master = true
const discordDatabase = require('../discorddatabase')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var args = command.split(" ")
    if(args.length==1){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" Command1,Command2,...,Command20")
        return;
    }
    var gcodeCommands = command.replace(args[0]+" ","").split(",")
    console.log(gcodeCommands)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}