const imageToBase64 = require('image-to-base64');
const config = require('../config.json');
const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')

async function retrieveWebcam(){
    const url = config.webcamsnapshoturl
    const path = Path.resolve(__dirname, '../temp', 'snapshot.png')
    const writer = Fs.createWriteStream(path)
    const snapshotpath = ""
    await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    }).then(res =>{
        res.data.pipe(writer)
        snapshotpath = __dirname+"/../temp/snapshot.png"
    }).catch(error =>{
        snapshotpath = __dirname+"/../snapshot-error.png"
    })
    return snapshotpath
}

module.exports = function(){}
module.exports.retrieveWebcam = async function (){
    return await retrieveWebcam()
}