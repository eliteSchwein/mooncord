const variables = require("../utils/variablesUtil")
const database = require('../discorddatabase')
const Discord = require('discord.js');
const config = require('../config.json');
var notifyarray = []

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(result)!="undefined"){
                if(typeof(result.version_info)!="undefined"){
                    variables.setVersions(result.version_info)
                    for(var softwareindex in  result.version_info){
                        var software = result.version_info[softwareindex]
                        console.log(softwareindex)
                    }
                    
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
                }
            }
        }
    })
})

async function sendMessage(channel,user){
    var snapshot = await webcamUtil.retrieveWebcam()
    var thumbnail = await thumbnailUtil.retrieveThumbnail()
    var statusEmbed = new Discord.MessageEmbed()
    .setColor('#25db00')
    .setTitle('Print Done')
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time',variables.getFormatedPrintTime(),true)
    .setTimestamp()

    if(typeof(user)=="undefined"){
        statusEmbed.setFooter("Automatic")
    }else{
        statusEmbed.setFooter(user.tag, user.avatarURL())
    }

    //channel.send(statusEmbed);
}
module.exports = event;