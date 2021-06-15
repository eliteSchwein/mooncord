const Discord = require('discord.js')

const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')

module.exports = {}
module.exports.printFileHandler = async (message, title, color) => {
    return await printFileHandler(message, title, color)
}
async function printFileHandler (message, title, color) {
    const messageJson = JSON.parse(message.utf8Data)
  let commandFeedback
  if (typeof (messageJson.error) !== 'undefined') {
      commandFeedback = `Not Found!`
      return commandFeedback
  }
  if (typeof (messageJson.result.filename) !== 'undefined') {
      const description = ''
          .concat(`Print Time: ${variables.formatTime(messageJson.result.estimated_time * 1000)}\n`)
          .concat(`Slicer: ${messageJson.result.slicer}\n`)
          .concat(`Slicer Version: ${messageJson.result.slicer_version}\n`)
          .concat(`Height: ${messageJson.result.object_height}mm`)
      
      commandFeedback = new Discord.MessageEmbed()
          .setColor(color)
          .setTitle(title)
          .setAuthor(messageJson.result.filename)
          .setDescription(description)
      console.log(messageJson.result.thumbnails)
      if (typeof (messageJson.result.thumbnails) !== 'undefined') {
          const parsedThumbnail = await thumbnail.buildThumbnail(messageJson.result.thumbnails[1].data)
          commandFeedback
              .attachFiles(parsedThumbnail)
              .setThumbnail(`attachment://${parsedThumbnail.name}`)
      }
      return commandFeedback
  }
}