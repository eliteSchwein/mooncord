const addChannel = require("./addchannel")
const config = require('../config.json')

var executeCommands = (function(command,channel,user,discordClient){
    if(command.toLowerCase().startsWith(addChannel.getCommand())){
        if(!isAdmin(user)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+addChannel.getCommand())
            return;
        }
        addChannel(command,channel,user,discordClient)
        return;
    }
    channel.send("<@"+user.id+"> The following Command couldn´t be found! \n> "+command.split(' ')[0]+"\n use "+config.prefix+"help")
})
module.exports = executeCommands;

function isAdmin(user){
    if(user.id==config.masterid){
        return true
    }

    return false
}