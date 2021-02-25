const imageToBase64 = require('image-to-base64');
const config = require('../config.json');
const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')

async function retrieveWebcam(){
    const url = config.webcamsnapshoturl
    const path = Path.resolve(__dirname, '../temp', 'snapshot.png')
    const writer = Fs.createWriteStream(path)
    return await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    }).then(res =>{
        return res.data.pipe(writer).on('end',()=>{
            return __dirname+"/../temp/snapshot.png"
        })
    }).catch(error => {
        return __dirname+"/../snapshot-error.png"
    })
}

module.exports = function(){}
module.exports.retrieveWebcam = async function (){
    return await retrieveWebcam()
}