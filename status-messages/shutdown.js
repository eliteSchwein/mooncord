const statusUtil = require('../utils/statusUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, user) {
  discordClient.user.setActivity('wait for Klipper', { type: 'LISTENING' })

  const snapshot = await webcamUtil.retrieveWebcam()

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Klipper Shutdown', '#c90000')
  statusEmbed
    .attachFiles(snapshot)
    .setImage(`attachment://${snapshot.name}`)
    
  return statusEmbed
}
module.exports = getModule
