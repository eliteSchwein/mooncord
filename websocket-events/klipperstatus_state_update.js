const variables = require("../utils/variablesUtil")
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
const config = require('../config.json');
var notifycheckarray = []
var notifyembed = new Discord.MessageEmbed()
.setColor('#fcf803')
.setTitle('Systemupdates')
.setTimestamp()

var event = (async (connection,discordClient) => {
    connection.on('message', async (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(result)!="undefined"){
                if(typeof(result.version_info)!="undefined"){
                    variables.setVersions(result.version_info)
                    var database = discordDatabase.getDatabase();
                    var postUpdate = false
                    for(var software in  result.version_info){
                        var softwareinfo = result.version_info[software]
                        if(software=="system"&&!notifycheckarray.includes(software)){
                            if(softwareinfo.package_count!=0){
                                notifycheckarray.push(software)
                                notifyembed.addField("System","Packages: "+softwareinfo.package_count,true)
                                postUpdate=true
                            }
                        }else{
                            if(softwareinfo.version!=softwareinfo.remote_version&&!notifycheckarray.includes(software)){
                                notifycheckarray.push(software)
                                notifyembed.addField(software,softwareinfo.version+" ▶️ "+softwareinfo.remote_version,true)
                                postUpdate=true
                            }
                        }
                    }
                    if(postUpdate){
                        for(var guildid in database){
                            await discordClient.guilds.fetch(guildid)
                            .then(async function(guild){
                                var guilddatabase = database[guild.id]
                                var broadcastchannels = guilddatabase.statuschannels
                                for(var index in broadcastchannels){
                                    var channel = guild.channels.cache.get(broadcastchannels[index]);
                                    await sendMessage(channel)
                                }
                            })
                            .catch(console.error);
                        }
                    }
                }
            }
        }
    })
})

async function sendMessage(channel){
    channel.send(notifyembed);
}
module.exports = event;