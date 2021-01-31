const config = require('../../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const websocketevents = require('../websocketevents')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var args = command.split(" ")
    args.shift()
    if(args.length==0||args.length<=1){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" <theme> <status>")
        return;
    }
    var themes = ""
    fs.readdirSync(__dirname+"/../themes").forEach(theme => {
        themes = themes.concat("`"+theme+"` ")
    });
    var themecheck = themes.split(" ")
    if(!themecheck.includes("`"+args[0]+"`")){
        channel.send("<@"+user.id+"> Invalid Theme: `"+args[0]+"`\nInstalled Themes:\n"+themes)
        return;
    }
    var statuslist = ""
    fs.readdirSync(__dirname+"/../websocket-events-test").forEach(status => {
        statuslist = statuslist.concat("`"+status+"` ")
    });
    var statuslistcheck = statuslist.split(" ")
    if(!statuslistcheck.includes("`"+args[1]+"`")){
        channel.send("<@"+user.id+"> Invalid Status: `"+args[1]+"`\nAviable Status:\n"+statuslist)
        return;
    }
    channel.startTyping();
    websocketevents.triggerStatusUpdateTest(discordClient,channel,args[0],args[1])
    channel.stopTyping();
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}