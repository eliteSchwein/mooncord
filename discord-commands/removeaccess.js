const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const command = "removeaccess"
var executeCommand = (function(command,channel,user,guild,discordClient){
    var database = discordDatabase.getGuildDatabase(guild)
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" <RoleAsTag/UserAsTag>")
        return;
    }
    if(args[0].startsWith("<@&")){
        var roleid = args[0].replace("<@&","").replace(">","")
        if(typeof guild.roles.cache.get(roleid) == "undefined"){
            channel.send("<@"+user.id+"> Invalid Role!")
            return
        }
        if(!database.accessroles.includes(roleid)){
            channel.send("<@"+user.id+"> the Role "+args[0]+" is not a Access Role!")
            return;
        }
        const index = database.accessroles.indexOf(roleid)
        if(index > -1){
            database.accessroles.splice(index,1)
        }
        discordDatabase.updateDatabase(database,guild)
        channel.send("<@"+user.id+"> removed the Role "+args[0]+" to the Access Roles!")
        
        return;
    }
    if(args[0].startsWith("<@")||args[0].startsWith("<@!")){
        var memberid = args[0].replace("<@!","").replace("<@","").replace(">","")
        if(typeof guild.members.cache.get(memberid) == "undefined"){
            channel.send("<@"+user.id+"> Invalid Member!")
            return
        }
        if(!database.accessusers.includes(memberid)){
            channel.send("<@"+user.id+"> the Member "+args[0]+" doesnt have Access!")
            return;
        }
        const index = database.accessusers.indexOf(memberid)
        if(index > -1){
            database.accessusers.splice(index,1)
        }
        discordDatabase.updateDatabase(database,guild)
        channel.send("<@"+user.id+"> the Member "+args[0]+" doesnt have any longer Access!")
        
        return;
    }
    channel.send("<@"+user.id+"> Invalid Arguments! Usage:\n> "+config.prefix+command+" <RoleAsTag/UserAsTag>")
    
})
module.exports = executeCommand;
module.exports.getCommand = function(){return command}