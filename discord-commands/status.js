const admin = false
const master = false
const variables = require('../utils/variablesUtil')

const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  channel.startTyping()
  variables.triggerStatusUpdate(discordClient, channel, guild, user)
  channel.stopTyping()
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
