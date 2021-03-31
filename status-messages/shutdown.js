const { status } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('wait for Klipper', { type: 'LISTENING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'Klipper Shutdown', '#c90000')
    
  return statusEmbed
}
module.exports = getModule
