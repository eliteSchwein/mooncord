const discordDatabase = require('../discorddatabase')
const webcamUtil = require('../utils/webcamUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const Discord = require('discord.js');
const variables = require('../websocketevents')

var getModule = (async function(discordClient,channel,guild,user){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Take a Break",{type: "PLAYING"})
     
    if(typeof channel =="undefined"){
        for(var guildid in database){
            discordClient.guilds.fetch(guildid)
            .then(async function(guild){
                var guilddatabase = database[guild.id]
                var broadcastchannels = guilddatabase.statuschannels
                for(var index in broadcastchannels){
                    var channel = guild.channels.cache.get(broadcastchannels[index]);
                    await sendMessage(channel,user)
                }
            })
            .catch(console.error);
        }
    }else{
        await sendMessage(channel,user)
    }
})

async function sendMessage(channel,user){
    var snapshot = await webcamUtil.retrieveWebcam()
    var thumbnail = await thumbnailUtil.retrieveThumbnail()
    var statusEmbed = new Discord.MessageEmbed()
    .setColor('#dbd400')
    .setTitle('Print Paused')
    .setAuthor(variables.getPrintFile())
    .addField('Print Time',variables.getPrintTime(),true)
    .addField('ETA Print Time',variables.getRestPrintTime(),true)
    .addField('Progress',variables.getPrintProgress(),true)
    .attachFiles([snapshot,thumbnail])
    .setImage(url="attachment://"+snapshot.name)
    .setThumbnail(url="attachment://"+thumbnail.name)
    .setTimestamp()

    if(user==null){
        statusEmbed.setFooter("Automatic")
    }else{
        statusEmbed.setFooter(user.tag, user.avatarURL())
    }

    channel.send(statusEmbed);
}
module.exports = getModule;