const statusUtil = require('../utils/statusUtil')

const getModule = async function (discordClient, channel, guild, user) {
  discordClient.user.setActivity('wait for Moonraker', { type: 'LISTENING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Connection Lost!', '#c90000')

  statusUtil.postStatus(discordClient, statusEmbed, channel)
}
module.exports = getModule
