const { status } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.user.setActivity('wait for User', { type: 'LISTENING' })

  const statusEmbed = status.getDefaultEmbed(user, 'A Error occured!', '#c90000')
  
  return statusEmbed
}
module.exports = getModule
