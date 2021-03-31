const { status } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('wait for User', { type: 'LISTENING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'A Error occured!', '#c90000')
  
  return statusEmbed
}
module.exports = getModule
