const axios = require('axios')
const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')
const jimp = require('jimp')

const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)

function retrieveWebcam () {
  return axios
    .get(config.webcam.url, {
      responseType: 'arraybuffer',
      timeout: 100
    })
    .then(
      async (response) => {
        const buffer = Buffer.from(response.data, 'base64')
        const image = await jimp.read(buffer)
        image.quality(config.webcam.quality)
        image.rotate(config.webcam.rotation)
        image.mirror(config.webcam.horizontal_mirror, config.webcam.vertical_mirror)
        const editbuffer = await image.getBufferAsync(jimp.MIME_PNG)
        return new Discord.MessageAttachment(editbuffer, 'snapshot.png')
      }
    )
    .catch(
      async (error) => {
        if (error) {
          console.log((error).error)
          return new Discord.MessageAttachment(await fs.readFile(path.resolve(__dirname, '../images/snapshot-error.png')), 'snapshot-error.png')
        }
      }
    )
}

module.exports.retrieveWebcam = function () {
  return retrieveWebcam()
}
