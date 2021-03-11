const statusUtil = require('../utils/statusUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, guild, user) {
  const snapshot = await webcamUtil.retrieveWebcam()
  const thumbnail = await thumbnailUtil.retrieveThumbnail()

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Printing', '#0099ff')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .addField('ETA Print Time', variables.getFormatedRemainingTime(), true)
    .addField('Progress', `${variables.getProgress()}%`, true)
    .attachFiles([snapshot, thumbnail])
    .setImage(`attachment://${snapshot.name}`)
    .setThumbnail(`attachment://${thumbnail.name}`)

  statusUtil.postStatus(discordClient, statusEmbed, channel)
}
module.exports = getModule
