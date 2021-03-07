const config = require('../config.json')
const Discord = require('discord.js')
const axios = require('axios')
const fs = require('fs').promises

async function retrieveWebcam () {
  return axios
    .get(config.webcamsnapshoturl, {
      responseType: 'arraybuffer'
    })
    .then(
      async (response) => {
        const buffer = Buffer.from(response.data, 'base64')
        return new Discord.MessageAttachment(buffer, 'snapshot.png')
      }
    )
    .catch(
      async (error) => {
        return new Discord.MessageAttachment(await fs.readFile(__dirname + '/../images/snapshot-error.png'), 'snapshot-error.png')
      }
    )
}

module.exports = function () {}
module.exports.retrieveWebcam = async function () {
  return await retrieveWebcam()
}
