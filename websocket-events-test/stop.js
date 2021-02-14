const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../config.json');

var template = '';

var getModule = (async function(theme){
    var feedback = ""
    await readTemplateFile('./themes/'+theme+'/templates/print_stop.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveThumbnail(template)
        template = await retrieveOverlay(template,theme)
        template = await retrieveProgress(template)
        template = await retrieveFile(template)
        template = await retrieveTime(template)
        template = await retrieveRestTime(template)
        template = await retrieveKlipperVersion(template)
        feedback = template
    });
    return template;
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

async function retrieveThumbnail(inputtemplate){
    var thumbnailtag = '{{thumbnail}}'
    var thumbnail = await imageToBase64(__dirname+"/../logo.png");
    inputtemplate = inputtemplate.replace(new RegExp(thumbnailtag,'g'),"data:image/gif;base64,"+thumbnail)
    return inputtemplate
}

async function retrieveTime(inputtemplate){
    var resttimetag = '{{printtime}}'
    inputtemplate = inputtemplate.replace(new RegExp(resttimetag,'g'),"01:59")
    return inputtemplate
}

async function retrieveProgress(inputtemplate){
    var progresstag = '{{progress}}'
    inputtemplate = inputtemplate.replace(new RegExp(progresstag,'g'),75)
    return inputtemplate
}

async function retrieveFile(inputtemplate){
    var filetag = '{{file}}'
    inputtemplate = inputtemplate.replace(new RegExp(filetag,'g'),"a_super_long_gcode_name.gcpde")
    return inputtemplate
}

async function retrieveRestTime(inputtemplate){
    var resttimetag = '{{resttime}}'
    inputtemplate = inputtemplate.replace(new RegExp(resttimetag,'g'),"01:59")
    return inputtemplate
}

async function retrieveKlipperVersion(inputtemplate){
    var klipperversiontag = '{{klipper_version}}'
    inputtemplate = inputtemplate.replace(new RegExp(klipperversiontag,'g'),"v0.9.1-179")
    return inputtemplate
}

function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}