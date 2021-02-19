const imageToBase64 = require('image-to-base64');
const discordDatabase = require('../discorddatabase')
const fs = require('fs');
var variables = require("../websocketevents")
const config = require('../config.json');

var template = '';

var getModule = (async function(theme){
    var feedback = ""
    await readTemplateFile('./themes/'+theme+'/templates/shutdown.html',async function (err,templatefile){
        template=templatefile
        template = await retrieveWebcam(template)
        template = await retrieveOverlay(template,theme)
        feedback = template
    });
    return template;
})
module.exports = getModule;

async function retrieveOverlay(inputtemplate,theme){
    try {
        if (!fs.existsSync("./themes/"+theme+"/overlay.png")) {
            var overlaytag = '{{overlay}}'
            inputtemplate = inputtemplate.replace(new RegExp(overlaytag,'g'),"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
            return inputtemplate
        }
    } catch(err) {
        console.log(err)
    }
    return imageToBase64("./themes/"+theme+"/overlay.png")
        .then(
            async (response)=> {
                var overlaytag = '{{overlay}}'
                inputtemplate = inputtemplate.replace(new RegExp(overlaytag,'g'),"data:image/gif;base64,"+response)
                return inputtemplate
            }
        )
        .catch(
            async (error) =>{
                var overlaytag = '{{overlay}}'
                inputtemplate = inputtemplate.replace(new RegExp(overlaytag,'g'),"data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")
                return inputtemplate
            }
        )
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