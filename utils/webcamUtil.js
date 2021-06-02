const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')
const jimp = require('jimp')

const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)

function retrieveWebcam() {
  return jimp.read(config.webcam.url)
    .then(image => {
        image.quality(config.webcam.quality)
        image.rotate(config.webcam.rotation)
        image.mirror(config.webcam.horizontal_mirror, config.webcam.vertical_mirror)
        image.contrast(config.webcam.contrast)
        image.brightness(config.webcam.brightness)
        if (config.webcam.greyscale) {
          image.greyscale()
        }
        const editbuffer = await image.getBufferAsync(jimp.MIME_PNG)
        return new Discord.MessageAttachment(editbuffer, 'snapshot.png')
    
    })
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
