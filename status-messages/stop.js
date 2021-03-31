const { status, thumbnail, variables } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.user.setActivity('stop Print', { type: 'LISTENING' })

  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = status.getDefaultEmbed(user, 'Print stopped', '#c90000')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
