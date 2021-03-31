const status = require('../utils/statusUtil')
const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('stop Print', { type: 'LISTENING' })

  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = await status.getDefaultEmbed(user, 'Print stopped', '#c90000')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
