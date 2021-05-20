const axios = require('axios')
const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')
const jimp = require('jimp')

const config = require('../webcamconfig.json')

function retrieveWebcam () {
  return axios
    .get(config.url, {
      responseType: 'arraybuffer',
      timeout: 100
    })
    .then(
      async (response) => {
        let buffer = Buffer.from(response.data, 'base64')
        const image = await jimp.read(buffer)
        image.rotate(config.rotation)
        image.mirror(config.horizontal_mirror, config.vertical_mirror)
        console.log(image)
        buffer = await image.getBase64
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
