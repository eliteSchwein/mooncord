const status = require('../utils/statusUtil')
const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('wait for Klipper', { type: 'LISTENING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'Printer Disconnected!', '#c90000')
  
  return statusEmbed
}
module.exports = getModule
