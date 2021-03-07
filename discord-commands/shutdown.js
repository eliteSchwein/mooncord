const config = require('../config.json')
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  channel.send('Goodbye World!')
  setTimeout(() => {
    new Discord()
  }, 1000)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
