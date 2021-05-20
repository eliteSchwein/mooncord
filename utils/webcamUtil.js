const config = require('../config.json')

const axios = require('axios')
const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')

async function retrieveWebcam () {
  return axios
    .get(config.webcamsnapshoturl, {
      responseType: 'arraybuffer'
    }, {
      setTimeout: 100
    })
    .then(
      async (response) => {
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

module.exports = function () {}
module.exports.retrieveWebcam = async function () {
  return await retrieveWebcam()
}
