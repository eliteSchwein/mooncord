const statusUtil = require('../utils/statusUtil')

const getModule = async function (discordClient, channel, user) {
  discordClient.user.setActivity('Printer start', { type: 'WATCHING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user, 'Printer starting', '#0099ff')
  
  return statusEmbed
}
module.exports = getModule
