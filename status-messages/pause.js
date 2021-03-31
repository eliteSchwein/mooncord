const statusUtil = require('../utils/statusUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')
const webcamUtil = require('../utils/webcamUtil')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.user.setActivity('take a Break', { type: 'PLAYING' })

  const snapshot = await webcamUtil.retrieveWebcam()
  const thumbnail = await thumbnailUtil.retrieveThumbnail()

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Print Paused', '#dbd400')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .addField('ETA Print Time', variables.getFormatedRemainingTime(), true)
    .addField('Progress', `${variables.getProgress()}%`, true)
    .attachFiles([snapshot, thumbnail])
    .setImage(`attachment://${snapshot.name}`)
    .setThumbnail(`attachment://${thumbnail.name}`)
  
  return statusEmbed
}
module.exports = getModule
