const admin = true
const master = false
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  channel.send('Working Soon!')
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
