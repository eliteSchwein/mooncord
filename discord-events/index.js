const command = require('./command')
const reaction = require('./reaction')
const upload = require('./upload')
const emotecommands = require('./emotecommands')

const getModules = function (discordClient, websocketConnection) {
  command(discordClient, websocketConnection)
  reaction(discordClient, websocketConnection)
  upload(discordClient, websocketConnection)
  emotecommands(discordClient, websocketConnection)
}
module.exports = getModules
