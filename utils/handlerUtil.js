const Discord = require('discord.js')

const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')
const locale = require('./localeUtil')

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
          .concat(`${locale.fileinfo.print_time}: ${variables.formatTime(messageJson.result.estimated_time * 1000)}\n`)
          .concat(`${locale.fileinfo.slicer}: ${messageJson.result.slicer}\n`)
          .concat(`${locale.fileinfo.slicer_version}: ${messageJson.result.slicer_version}\n`)
          .concat(`${locale.fileinfo.height}: ${messageJson.result.object_height}mm`)
      
      commandFeedback = new Discord.MessageEmbed()
          .setColor(color)
          .setTitle(title)
          .setAuthor(messageJson.result.filename)
          .setDescription(description)
      let path
      if (typeof (messageJson.result.thumbnails) !== 'undefined') {
          path = messageJson.result.thumbnails[1].relative_path
      }
        const parsedThumbnail = await thumbnail.buildThumbnail(path)
        commandFeedback
            .attachFiles(parsedThumbnail)
            .setThumbnail(`attachment://${parsedThumbnail.name}`)
      return commandFeedback
  }
}