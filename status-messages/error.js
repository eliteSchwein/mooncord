const status = require('../utils/statusUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('wait for User', { type: 'LISTENING' })

  const statusEmbed = await status.getDefaultEmbed(user, 'A Error occured!', '#c90000')
  
  return statusEmbed
}
module.exports = getModule
