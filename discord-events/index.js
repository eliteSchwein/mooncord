const command = require('./command')
const emotecommands = require('./emotecommands')
const reaction = require('./reaction')
const upload = require('./upload')

const getModules = function (discordClient, websocketConnection) {
  command(discordClient, websocketConnection)
  reaction(discordClient, websocketConnection)
  upload(discordClient, websocketConnection)
  emotecommands(discordClient, websocketConnection)
}
module.exports = getModules
