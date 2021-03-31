const { status, thumbnail, variables } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.user.setActivity('Finished Print', { type: 'WATCHING' })
  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = status.getDefaultEmbed(user, 'Print Done', '#25db00')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
