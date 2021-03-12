const admin = false
const master = true
const variables = require('../utils/variablesUtil')

const id = Math.floor(Math.random() * 10000) + 1
let wsConnection
const executeReaction = function (message, user, guild, emote, discordClient, websocketConnection) {
  wsConnection = websocketConnection
  if (variables.getStatus() !== 'ready') {
    message.channel.send(`<@${user.id}> the Printer is not ready!`)
    message.delete()
    return
  }
  if (emote.name === '❌') {
    message.channel.send(`<@${user.id}> You cancel the Print!`)
    message.delete()
    return
  }
  if (emote.name === '✅') {
    websocketConnection.send(`{"jsonrpc": "2.0", "method": "printer.print.start", "params": {"filename": "${message.embeds[0].author.name}"}, "id": ${id}}`)
    message.delete()
  }
}

module.exports = executeReaction
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
