const admin = true
const master = false
const variables = require('../utils/variablesUtil')

const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  if (variables.getStatus() !== 'printing' && variables.getStatus() !== 'pause') {
    channel.send(`<@${user.id}> the Printer isn\`t currently Printing!`)
    return
  }
  channel.send(`<@${user.id}> you canceled the Print!`)
  const id = Math.floor(Math.random() * 10_000) + 1
  websocketConnection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "CANCEL_PRINT"}, "id": ${id}}`)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
