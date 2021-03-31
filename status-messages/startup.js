const { status } = require('../utils')

const getModule = async function (user) {
  discordClient.user.setActivity('Printer start', { type: 'WATCHING' })

  const statusEmbed = status.getDefaultEmbed(user, 'Printer starting', '#0099ff')
  
  return statusEmbed
}
module.exports = getModule
