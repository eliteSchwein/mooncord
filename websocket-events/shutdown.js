const discordDatabase = require('../discorddatabase')
const webcamUtil = require('../utils/webcamUtil')
const Discord = require('discord.js');

var getModule = (async function(discordClient,channel,guild,user){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Wait for Klipper",{type: "LISTENING"})
     
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

function sendMessage(channel,theme){
    var snapshot = await webcamUtil.retrieveWebcam()
    var statusEmbed = new Discord.MessageEmbed()
    .setColor('#c90000')
    .setTitle('Shutdown')
    .attachFiles(snapshot)
    .setImage(url="attachment://"+snapshot.name)
    .setTimestamp()

    if(user==null){
        statusEmbed.setFooter("Automatic")
    }else{
        statusEmbed.setFooter(user.tag, user.avatarURL())
    }

    channel.send(statusEmbed);
}
module.exports = getModule;