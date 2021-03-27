const statusUtil = require('../utils/statusUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, user) {
  discordClient.user.setActivity(`start: ${variables.getCurrentFile()}`, { type: 'LISTENING' })

  const snapshot = await webcamUtil.retrieveWebcam()
  const thumbnail = await thumbnailUtil.retrieveThumbnail()

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Print started', '#25db00')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .attachFiles([snapshot, thumbnail])
    .setImage(`attachment://${snapshot.name}`)
    .setThumbnail(`attachment://${thumbnail.name}`)

  statusUtil.postStatus(discordClient, statusEmbed, channel)
}
module.exports = getModule
