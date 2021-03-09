const statusUtil = require('../utils/statusUtil')

const getModule = async function (discordClient, channel, guild, user) {
  discordClient.user.setActivity('Printer start', { type: 'WATCHING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user,'Printer starting','#0099ff')

  statusUtil.postStatus(discordClient,statusEmbed,channel)
}
module.exports = getModule
