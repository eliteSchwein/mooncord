const fs = require('fs')
const config = require('../../config.json')
const discordDatabase = require('../discorddatabase')

var executeCommands = (function(command,channel,user,guild,discordClient,websocketClient){
    if(command.toLowerCase().startsWith("index")){
        channel.send("<@"+user.id+"> Ha you are so Funny!")
        return;
    }
    try {
        if (!fs.existsSync(__dirname+"/"+command.toLowerCase().split(" ")[0]+".js")) {
            channel.send("<@"+user.id+"> The following Command couldn´t be found! \n> "+config.prefix+command.split(' ')[0]+"\n use "+config.prefix+"help")
            return;
        }
    } catch(err) {
        console.error(err)
    }
    const commandModule = require("./"+command.split(" ")[0])
    if(commandModule.needMaster()){
        if(user.id!=config.masterid){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
            return;
        }
    }
    if(commandModule.needAdmin()){
        if(!isAdmin(user,guild)){
            channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
            return;
        }
    }
    if(!isAllowed(user,guild)){
        channel.send("<@"+user.id+"> You are not allowed to execute the following Command! \n> "+config.prefix+command.split(" ")[0])
        return;
    }
    commandModule(command,channel,user,guild,discordClient,websocketClient);
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