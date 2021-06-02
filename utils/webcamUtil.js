const axios = require('axios')
const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')
const jimp = require('jimp')

const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)

function retrieveWebcam() {
  console.log(config.webcam)
  return axios
    .get(config.webcam.url, {
      responseType: 'arraybuffer',
      timeout: 100
    })
    .then(
      async (response) => {
        const buffer = Buffer.from(response.data, 'base64')
        const image = await jimp.read(buffer)
        console.log(0)
        image.quality(config.webcam.quality)
        console.log(1)
        image.rotate(config.webcam.rotation)
        console.log(2)
        image.mirror(config.webcam.horizontal_mirror, config.webcam.vertical_mirror)
        console.log(3)
        image.contrast(config.webcam.contrast)
        console.log(4)
        image.brightness(config.webcam.brightness)
        console.log(5)
        if (config.webcam.greyscale) {
          image.greyscale()
        console.log("5.1")
        }
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
