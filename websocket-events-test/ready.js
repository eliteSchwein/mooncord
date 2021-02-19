const imageToBase64 = require('image-to-base64');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../config.json');

var template = '';

var getModule = (async function(theme){
    feedback = ""
    await readTemplateFile('./themes/'+theme+'/templates/ready.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveOverlay(template,theme)
        template = await retrieveKlipperVersion(template)
        feedback=template;
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