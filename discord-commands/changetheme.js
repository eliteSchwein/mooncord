const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
const admin = true
const master = false
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var database = discordDatabase.getGuildDatabase(guild)
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        database.theme="default";
        discordDatabase.updateDatabase(database,guild);
        channel.send("<@"+user.id+"> Switch to Default Theme: \n `"+config.defaulttheme+"`")
        return;
    }
    var themes = ""
    fs.readdirSync(__dirname+"/../themes").forEach(theme => {
        themes = themes.concat("`"+theme+"` ")
    });
    if(!themes.includes(args[0])){
        channel.send("<@"+user.id+"> Invalid Theme: `"+args[0]+"`\nInstalled Themes:\n"+themes)
        return;
    }
    database.theme=args[0];
    discordDatabase.updateDatabase(database,guild);
    channel.send("<@"+user.id+"> Switch to Theme: \n `"+args[0]+"`")
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}