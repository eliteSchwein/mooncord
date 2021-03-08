const config = require('../config.json')
const commandHandler = require('../discord-commands')

const enableEvent = function (discordClient, websocketConnection) {
  discordClient.on('message', msg => {
    if (msg.channel.type === 'dm') {
      msg.author.send('DM is not Supportet!')
      return
    }
    if (msg.channel.type !== 'text') {
      return
    }
    if (msg.toString().startsWith(config.prefix)) {
      commandHandler(msg.toString().slice(config.prefix.length), msg.channel, msg.author, msg.channel.guild, discordClient, websocketConnection)
    }
  })
}
module.exports = enableEvent
