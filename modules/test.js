const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');
var variables = require("./variables")

var template = '';

var getModule = (function(express){
        express.get('/test', async function (req, res) {
            readTemplateFile('./templates/modules/test.html',async function (err,templatefile){
                template=templatefile
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
    inputtemplate = inputtemplate.replace(overlaytag,"data:image/gif;base64,"+base64overlay)
    return inputtemplate
}

async function retrieveWebcam(inputtemplate){
    var base64cam = await imageToBase64("https://elitepr1nt3r.eliteschw31n.de/frontcam/?action=snapshot");
    var webcamtag = '{{webcam}}'
    inputtemplate = inputtemplate.replace(webcamtag,"data:image/gif;base64,"+base64cam)
    return inputtemplate
}

async function retrieveThumbnail(inputtemplate){
    var thumbnailtag = '{{thumbnail}}'
    inputtemplate = inputtemplate.replace(thumbnailtag,"data:image/gif;base64,"+variables.getThumbnail)
    return inputtemplate
}
function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}