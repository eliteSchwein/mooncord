const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../../config.json');

var template = '';

var getModule = (async function(discordClient,channel,theme){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Stopping...",{type: "WATCHING"})
    readTemplateFile('./templates/'+theme+'/modules/print_stop.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveThumbnail(template)
        template = await retrieveOverlay(template)
        template = await retrieveProgress(template)
        template = await retrieveFile(template)
        template = await retrieveTime(template)
        template = await retrieveRestTime(template)
        template = await retrieveKlipperVersion(template)
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

async function retrieveOverlay(inputtemplate){
    var base64overlay = await imageToBase64("./templates/"+theme+"/overlay.png");
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

async function retrieveThumbnail(inputtemplate){
    var thumbnailtag = '{{thumbnail}}'
    var thumbnail = variables.getThumbnail()
    inputtemplate = inputtemplate.replace(new RegExp(thumbnailtag,'g'),"data:image/gif;base64,"+thumbnail)
    return inputtemplate
}

async function retrieveTime(inputtemplate){
    var resttimetag = '{{printtime}}'
    inputtemplate = inputtemplate.replace(new RegExp(resttimetag,'g'),variables.getPrintTime())
    return inputtemplate
}

async function retrieveProgress(inputtemplate){
    var progresstag = '{{progress}}'
    inputtemplate = inputtemplate.replace(new RegExp(progresstag,'g'),variables.getPrintProgress().toFixed(0))
    return inputtemplate
}

async function retrieveFile(inputtemplate){
    var filetag = '{{file}}'
    inputtemplate = inputtemplate.replace(new RegExp(filetag,'g'),variables.getPrintFile())
    return inputtemplate
}

async function retrieveRestTime(inputtemplate){
    var resttimetag = '{{resttime}}'
    inputtemplate = inputtemplate.replace(new RegExp(resttimetag,'g'),variables.getRestPrintTime())
    return inputtemplate
}

async function retrieveKlipperVersion(inputtemplate){
    var klipperversiontag = '{{klipper_version}}'
    inputtemplate = inputtemplate.replace(new RegExp(klipperversiontag,'g'),variables.getKlipperVersion().substring(0,10))
    return inputtemplate
}

function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}