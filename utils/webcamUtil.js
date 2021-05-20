const axios = require('axios')
const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')

const config = require('../webcamconfig.json')

function retrieveWebcam () {
  return axios
    .get(config.url, {
      responseType: 'arraybuffer',
      timeout: 100
    })
    .then(
      (response) => {
        const buffer = Buffer.from(response.data, 'base64')
        return new Discord.MessageAttachment(buffer, 'snapshot.png')
      }
    )
    .catch(
      async (error) => {
        if (error) {
          return new Discord.MessageAttachment(await fs.readFile(path.resolve(__dirname, '../images/snapshot-error.png')), 'snapshot-error.png')
        }
      }
    )
}

module.exports.retrieveWebcam = function () {
  return retrieveWebcam()
}
