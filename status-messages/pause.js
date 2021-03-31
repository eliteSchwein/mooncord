const status = require('../utils/statusUtil')
const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

const discordClient = require('../clients/discordclient') 

const getModule = async function (user) {
  discordClient.getClient().user.setActivity('take a Break', { type: 'PLAYING' })

  const thumbnailpic = await thumbnail.retrieveThumbnail()

  const statusEmbed = await status.getDefaultEmbed(user, 'Print Paused', '#dbd400')
  statusEmbed
    .setAuthor(variables.getCurrentFile())
    .addField('Print Time', variables.getFormatedPrintTime(), true)
    .addField('ETA Print Time', variables.getFormatedRemainingTime(), true)
    .addField('Progress', `${variables.getProgress()}%`, true)
    .attachFiles([thumbnailpic])
    .setThumbnail(`attachment://${thumbnailpic.name}`)
  
  return statusEmbed
}
module.exports = getModule
