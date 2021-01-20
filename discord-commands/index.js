const addChannel = require("./addchannel")
const removeChannel = require("./removechannel")
const addAdmin = require("./addadmin")
const removeAdmin = require("./removeadmin")
const addAccess = require("./addaccess")
const removeAccess = require("./removeaccess")
const status = require("./status")
const config = require('../../config.json')
const discordDatabase = require('../discorddatabase')

var executeCommands = (function(command,channel,user,guild,discordClient){
    if(command.toLowerCase().startsWith(addChannel.getCommand())){
        if(!isAdmin(user,guild)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+addChannel.getCommand())
            return;
        }
        addChannel(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(removeChannel.getCommand())){
        if(!isAdmin(user,guild)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+removeChannel.getCommand())
            return;
        }
        removeChannel(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(addAdmin.getCommand())){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+addAdmin.getCommand())
            return;
        }
        addAdmin(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(removeAdmin.getCommand())){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+removeAdmin.getCommand())
            return;
        }
        removeAdmin(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(addAccess.getCommand())){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+addAccess.getCommand())
            return;
        }
        addAccess(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(removeAccess.getCommand())){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+removeAccess.getCommand())
            return;
        }
        removeAccess(command,channel,user,guild,discordClient)
        return;
    }
    if(command.toLowerCase().startsWith(status.getCommand())){
        if(!isAllowed(user,guild)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+status.getCommand())
            return;
        }
        status(command,channel,user,guild,discordClient)
        return;
    }
    channel.send("<@"+user.id+"> The following Command couldn´t be found! \n> "+config.prefix+command.split(' ')[0]+"\n use "+config.prefix+"help")
})
module.exports = executeCommands;

function isAdmin(user,guild){
    var database = discordDatabase.getGuildDatabase(guild)
    var member = guild.member(user)
    if(user.id==config.masterid){
        return true
    }
    if(database.adminusers.includes(user.id)){
        return true
    }
    for(var memberole in member.roles.cache){
        if(database.adminroles.includes(memberole)){
            return true
        }
    }
    return false
}
function isAllowed(user,guild){
    var database = discordDatabase.getGuildDatabase(guild)
    var member = guild.member(user)
    if(database.accesseveryone==true){
        return true;
    }
    if(isAdmin(user,guild)){
        return true;
    }
    if(database.accessusers.includes(user.id)){
        return true
    }
    for(var memberole in member.roles.cache){
        if(database.accessroles.includes(memberole)){
            return true
        }
    }
    return false
}