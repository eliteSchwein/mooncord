const config = require('../../config.json');
const admin = false
const master = true
const fs = require('fs');
const discordDatabase = require('../discorddatabase')
const websocketevents = require('../websocketevents')
const express = require('express')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var runningServer = false;
    var testServer = express()
    var args = command.split(" ")
    args.shift()
    if(args.length==0){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" <theme>")
        return;
    }
    var theme =args[0]
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
    fs.readdirSync(__dirname+"/../websocket-events-test").forEach(async status => {
        statuslist = statuslist.concat("`"+status.replace(".js","")+"` ")
        var template = require("../websocket-events-test/"+status.replace(".js",""))
        testServer.get('/'+status.replace(".js",""), async function (req, res) {
            var html = await template(theme);
            console.log(html)
            res.set('Content-Type', 'text/html');
            res.send(Buffer.from(html))
        })
    });
    channel.send("<@"+config.masterid+"> Please use the Test Webserver,\n URL: LocalBotIPAddress:8090/status\nStatus:\n"+statuslist)
    if(!runningServer){
        runningServer=true
        testServer.listen(8090)
    }
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}