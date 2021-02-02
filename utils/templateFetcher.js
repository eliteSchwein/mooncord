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
    var thumbnail = variables.getThumbnail()
    inputtemplate = inputtemplate.replace(new RegExp(thumbnailtag,'g'),"data:image/gif;base64,"+thumbnail)
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

async function retrieveTime(inputtemplate){
    var resttimetag = '{{printtime}}'
    inputtemplate = inputtemplate.replace(new RegExp(resttimetag,'g'),variables.getPrintTime())
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
module.exports = function(){}
module.exports.retrieveOverlay = async function(inputtemplate,theme){
    return await retrieveOverlay(inputtemplate,theme)
}
module.exports.retrieveWebcam = async function (inputtemplate){
    return await retrieveWebcam(inputtemplate)
}
module.exports.retrieveThumbnail = async function (inputtemplate){
    return await retrieveThumbnail(inputtemplate)
}
module.exports.retrieveProgress = async function (inputtemplate){
    return await retrieveProgress(inputtemplate)
}
module.exports.retrieveFile = async function (inputtemplate){
    return await retrieveFile(inputtemplate)
}
module.exports.retrieveTime = async function (inputtemplate){
    return await retrieveTime(inputtemplate)
}
module.exports.retrieveRestTime = async function (inputtemplate){
    return await retrieveRestTime(inputtemplate)
}
module.exports.retrieveKlipperVersion = async function (inputtemplate){
    return await retrieveKlipperVersion(inputtemplate)
}