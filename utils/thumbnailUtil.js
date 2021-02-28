var variables = require("../websocketevents");
const Discord = require('discord.js');
const fs = require('fs').promises

async function retrieveThumbnail(){
    var thumbnail = variables.getThumbnail()
    if(typeof(thumbnail)=="undefined"||thumbnail==""){
        return new Discord.MessageAttachment(await fs.readFile(__dirname+"/../thumbnail_not_found.png"),"thumbnail_not_found.png")
    }
    var buffer = new Buffer.from(thumbnail,"base64")
    return new Discord.MessageAttachment(buffer,"thumbnail.png")
}

module.exports = function(){}
module.exports.retrieveThumbnail = async function (){
    return await retrieveThumbnail()
}