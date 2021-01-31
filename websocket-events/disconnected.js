const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../../config.json');

var template = '';

var getModule = (async function(discordClient,channel,guild){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Disconnected...",{type: "LISTENING"})
    
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
    readTemplateFile('./themes/'+theme+'/templates/disconnected.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveOverlay(template,theme)
        channel.send({
            files:[{
                attachment: image,
                name: 'ready.png'
            }]
        })
    });
}
module.exports = getModule;

async function retrieveOverlay(inputtemplate,theme){
    var base64overlay = await imageToBase64("./themes/"+theme+"/overlay.png");
    var overlaytag = '{{overlay}}'
    inputtemplate = inputtemplate.replace(new RegExp(overlaytag,'g'),"data:image/gif;base64,"+base64overlay)
    return inputtemplate
}

async function retrieveWebcam(inputtemplate){
    var base64cam = await imageToBase64(config.webcamsnapshoturl);
    var webcamtag = '{{webcam}}'
    inputtemplate = inputtemplate.replace(new RegExp(webcamtag,'g'),"data:image/gif;base64,"+base64cam)
    return inputtemplate
}

function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}