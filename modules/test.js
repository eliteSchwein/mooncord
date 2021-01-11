const imageToBase64 = require('image-to-base64');
const nodeHtmlToImage = require('node-html-to-image');
const fs = require('fs');

var template = '';

var getModule = (function(express){
    readTemplateFile('./templates/modules/test.html',function (err,templatefile){
        template=templatefile
        express.get('/test', async function (req, res) {
            var webcam = await retrieveWebcam(template)
            res.send(webcam)
        });
    });
})
module.exports = getModule;

async function retrieveWebcam(inputtemplate){
    var base64cam = await imageToBase64("https://elitepr1nt3r.eliteschw31n.de/frontcam/?action=snapshot");
    var webcamtag = '{{webcam}}'
    inputtemplate = inputtemplate.replace(webcamtag,base64cam)
    return inputtemplate
}
function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}