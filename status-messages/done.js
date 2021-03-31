const status = require('../utils/statusUtil')
const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('Finished Print', { type: 'WATCHING' })
  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = await status.getDefaultEmbed(user, 'Print Done', '#25db00')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
