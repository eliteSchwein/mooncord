const status = require('../utils/statusUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.user.setActivity('wait for Moonraker', { type: 'LISTENING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'Connection Lost!', '#c90000')

  return statusEmbed
}
module.exports = getModule
