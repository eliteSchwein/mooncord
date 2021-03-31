const status = require('../utils/statusUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('Printer start', { type: 'WATCHING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'Printer starting', '#0099ff')
  
  return statusEmbed
}
module.exports = getModule
