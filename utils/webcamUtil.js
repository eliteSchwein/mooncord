const imageToBase64 = require('image-to-base64');
const config = require('../config.json');
const Discord = require('discord.js');
const fs = require('fs').promises

async function retrieveWebcam(){
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