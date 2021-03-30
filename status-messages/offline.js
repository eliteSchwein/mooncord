const statusUtil = require('../utils/statusUtil')

const getModule = async function (discordClient, user) {
  discordClient.user.setActivity('wait for Moonraker', { type: 'LISTENING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Connection Lost!', '#c90000')

  
  return statusEmbed
}
module.exports = getModule
