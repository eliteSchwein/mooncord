const config = require('../config.json');
const admin = false
const master = true
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var args = command.split(" ")
    if(args.length==1){
        channel.send("<@"+user.id+"> Missing Arguments! Usage:\n> "+config.prefix+command+" Command1,Command2,...,Command20")
        return;
    }
    var gcodeCommands = command.replace(args[0]+" ","").split(",")
    if(gcodeCommands.length>=20){
        channel.send("<@"+user.id+"> Too many GCode Commands! The current Limit is 20")
        return;
    }
    var gcodeList = ""
    for(var i = 0; i<=gcodeCommands.length-1;i++){
        gcodeList=gcodeList.concat("`"+gcodeCommands[i]+"` ")
    }
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Execute GCode Commands')
	.setDescription(gcodeList)
    .attachFiles(__dirname+"/..images//execute.png")
    .setThumbnail(url="attachment://execute.png")
	.setTimestamp()
	.setFooter(user.tag, user.avatarURL());

    channel.send(exampleEmbed);
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}