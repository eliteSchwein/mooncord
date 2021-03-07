const config = require('../config.json')
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const variables = require('../utils/variablesUtil')
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  if (variables.getStatus() != 'printing') {
    channel.send('<@' + user.id + '> the Printer isn`t currently Printing!')
    return
  }
  channel.send('<@' + user.id + '> you pausing the Print!')
  const id = Math.floor(Math.random() * 10000) + 1
  websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.print.pause", "id": ' + id + '}')
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
