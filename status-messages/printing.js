const status = require('../utils/statusUtil')
const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

const getModule = async function (user) {
  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = await status.getDefaultEmbed(user, 'Printing', '#0099ff')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .addField('ETA Print Time', variables.getFormatedRemainingTime(), true)
    .addField('Progress', `${variables.getProgress()}%`, true)
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
