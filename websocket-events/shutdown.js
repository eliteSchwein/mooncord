const discordDatabase = require('../discorddatabase')
const fetcher = require('../utils/templateFetcher')
const fs = require('fs');
const config = require('../config.json');

var template = '';

var getModule = (async function(discordClient,channel,guild){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Shutdown...",{type: "LISTENING"})
    
    if(typeof channel =="undefined"){
        for(var guildid in database){
            discordClient.guilds.fetch(guildid)
            .then(function(guild){
                var guilddatabase = database[guild.id]
                var theme = config.defaulttheme
                if(guilddatabase.theme!="default"){
                    theme=guilddatabase.theme
                }
                var broadcastchannels = guilddatabase.statuschannels
                for(var index in broadcastchannels){
                    var channel = guild.channels.cache.get(broadcastchannels[index]);
                    sendMessage(channel,theme)
                }
            })
            .catch(console.error);
        }
    }else{
        var guilddatabase = database[guild.id]
        var theme = config.defaulttheme
        if(guilddatabase.theme!="default"){
            theme=guilddatabase.theme
        }
        sendMessage(channel,theme)
    }
})

function sendMessage(channel,theme){
    readTemplateFile('./themes/'+theme+'/templates/shutdown.html',async function (err,templatefile){
        if(err){
            channel.send("The File `templates/shutdown.html` \ncouldn't be found in the Theme:\n`"+theme+"`")
            return
        }
        template=templatefile
        template = await fetcher.retrieveWebcam(template)
        template = await fetcher.retrieveOverlay(template,theme)
        await fetcher.sendTemplate(template,channel)
    });
}
module.exports = getModule;

function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}