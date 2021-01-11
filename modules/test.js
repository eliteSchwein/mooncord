const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
var variables = require("./variables")

var template = '';

var getModule = (function(express){
    readTemplateFile('./templates/modules/test.html',function (err,templatefile){
        template=templatefile
        express.get('/test', async function (req, res) {
            var webcam = await retrieveWebcam(template)
            var thumbnail = await retrieveThumbnail(webcam)
            var overlay = await retrieveOverlay(thumbnail)
            res.send(overlay)
        });
    });
})
module.exports = getModule;

async function retrieveOverlay(inputtemplate){
    var base64overlay = await imageToBase64("./templates/overlay.png");
    var overlaytag = '{{overlay}}'
    inputtemplate = inputtemplate.replace(overlaytag,base64overlay)
    return inputtemplate
}

async function retrieveWebcam(inputtemplate){
    var base64cam = await imageToBase64("https://elitepr1nt3r.eliteschw31n.de/frontcam/?action=snapshot");
    var webcamtag = '{{webcam}}'
    inputtemplate = inputtemplate.replace(webcamtag,base64cam)
    return inputtemplate
}

async function retrieveThumbnail(inputtemplate){
    var thumbnailtag = '{{thumbnail}}'
    inputtemplate = inputtemplate.replace(thumbnailtag,variables.getThumbnail)
    return inputtemplate
}
function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}