const discordDatabase = require('../discorddatabase')
const webcamUtil = require('../utils/webcamUtil')
const Discord = require('discord.js');
const fs = require('fs');

var getModule = (async function(discordClient,channel,guild){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("GCODE File...",{type: "LISTENING"})
    
    if(typeof channel =="undefined"){
        for(var guildid in database){
            discordClient.guilds.fetch(guildid)
            .then(function(guild){
                var guilddatabase = database[guild.id]
                var broadcastchannels = guilddatabase.statuschannels
                for(var index in broadcastchannels){
                    var channel = guild.channels.cache.get(broadcastchannels[index]);
                    sendMessage(channel)
                }
            })
            .catch(console.error);
        }
    }else{
        sendMessage(channel)
    }
})

function sendMessage(channel){
    var snapshot = await webcamUtil.retrieveWebcam()
    const statusEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Printer Ready')
    .setAuthor('')
    .setDescription('')
    .attachFiles(snapshot)
    .setImage(url="attachment://"+snapshot.name)
    .setTimestamp()

    channel.send(statusEmbed);
}
module.exports = getModule;