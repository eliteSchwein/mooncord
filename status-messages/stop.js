const statusUtil = require('../utils/statusUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, user) {
  discordClient.user.setActivity('stop Print', { type: 'LISTENING' })

  const snapshot = await webcamUtil.retrieveWebcam()
  const thumbnail = await thumbnailUtil.retrieveThumbnail()

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Print stopped', '#c90000')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .attachFiles([snapshot, thumbnail])
    .setImage(`attachment://${snapshot.name}`)
    .setThumbnail(`attachment://${thumbnail.name}`)
  
  return statusEmbed
}
module.exports = getModule
