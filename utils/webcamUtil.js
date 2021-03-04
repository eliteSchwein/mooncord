const imageToBase64 = require('image-to-base64');
const config = require('../config.json');
const Discord = require('discord.js');
const axios = require('axios')
const fs = require('fs').promises

async function retrieveWebcam(){
    axios
    .get(config.webcamsnapshoturl, {
        responseType: 'arraybuffer'
    })
    .then(response => {
        console.log(response)
        const buffer = Buffer.from(response.data, 'base64');
    })
    .catch(ex => {
        console.error(ex);
    });
    return imageToBase64(config.webcamsnapshoturl)
        .then(
            async (response)=> {
                var buffer = new Buffer.from(response,"base64")
                return new Discord.MessageAttachment(buffer,"snapshot.png")
            }
        )
        .catch(
            async (error) =>{
                return new Discord.MessageAttachment(await fs.readFile(__dirname+"/../snapshot-error.png"),"snapshot-error.png")
            }
        )
}

module.exports = function(){}
module.exports.retrieveWebcam = async function (){
    return await retrieveWebcam()
}