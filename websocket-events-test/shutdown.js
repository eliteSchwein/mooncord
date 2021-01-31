const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../../config.json');

var template = '';

var getModule = (async function(discordClient,channel,theme){
    var database = discordDatabase.getDatabase();
    readTemplateFile('./themes/'+theme+'/templates/shutdown.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveOverlay(template,theme)
        var image = await nodeHtmlToImage({html:template})
        if(typeof channel =="undefined"){
            for(var guildid in database){
                discordClient.guilds.fetch(guildid)
                .then(function(guild){
                    var guilddatabase = database[guild.id]
                    var broadcastchannels = guilddatabase.statuschannels
                    for(var index in broadcastchannels){
                        var channel = guild.channels.cache.get(broadcastchannels[index]);
                        channel.send({
                            files:[{
                                attachment: image,
                                name: 'ready.png'
                            }]
                        })
                    }
                })
                .catch(console.error);
            }
        }else{
            channel.send({
                files:[{
                    attachment: image,
                    name: 'ready.png'
                }]
            })
        }
        
        //res.type("image/png")
        //res.send(image)
    });
})
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