const { TextChannel } = require('discord.js');
const config = require('../../config.json');
const commandHandler = require("../discord-commands/index")
const discordDataBase = require('../discorddatabase')
var enableEvent = (function(discordClient){
    discordClient.on('message', msg => {
      if(msg.channel.type=="dm"){
        msg.author.send("DM is not Supportet!");
        return;
      }
      if(msg.channel.type!="text"){

        return;
      }
      if (msg.toString().startsWith(config.prefix)) {
        commandHandler(msg.toString().substring(config.prefix.length),msg.channel,msg.author,msg.channel.guild,discordClient)
      }
    });
})
module.exports = enableEvent;