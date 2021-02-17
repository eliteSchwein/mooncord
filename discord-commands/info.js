const config = require('../config.json');
const pjson = require('../package.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){

    var description = ""+
    "Version: "+pjson.version+"\n"+
    "Author: "+pjson.author+"\n"+
    "Homepage: "+pjson.homepage+"\n"
    
    const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Informations')
    .setAuthor(discordClient.user.tag,discordClient.user.avatarURL())
    .setDescription(description)
    .attachFiles(__dirname+"/../logo.png")
    .setThumbnail(url="attachment://logo.png")
    .setTimestamp()
    .setFooter(user.tag, user.avatarURL());

    channel.send(exampleEmbed);
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}