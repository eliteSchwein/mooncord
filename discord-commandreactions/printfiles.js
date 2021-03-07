const enableEvent = function (discordClient, websocketConnection, message) {
  message.react('◀️')
  message.react('▶️')
}
module.exports = enableEvent
