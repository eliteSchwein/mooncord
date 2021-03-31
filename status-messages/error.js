const statusUtil = require('../utils/statusUtil')
const webcamUtil = require('../utils/webcamUtil')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  const snapshot = await webcamUtil.retrieveWebcam()
  discordClient.user.setActivity('wait for User', { type: 'LISTENING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'A Error occured!', '#c90000')
  statusEmbed
    .attachFiles(snapshot)
    .setImage(`attachment://${snapshot.name}`)
  
  return statusEmbed
}
module.exports = getModule
