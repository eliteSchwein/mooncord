const Discord = require('discord.js')
const logSymbols = require('log-symbols')
const path = require('path')

const config = require('../statusconfig.json')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient, database) => {
  const id = Math.floor(Math.random() * parseInt('10_000')) + 1
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) !== 'undefined' && methode === 'notify_gcode_response') {
      const { params } = messageJson
      console.log(params)
      if(params[0].startsWith("mooncord.broadcast")) {
        const message = params[0].replace("mooncord.broadcast ", "")
        const broadcastembed = new Discord.MessageEmbed()
          .setColor('#03f4fc')
          .setTitle('Message')
          .attachFiles(path.resolve(__dirname, '../images/notification.png'))
          .setThumbnail('attachment://notification.png')
          .setTimestamp()
          .setDescription(message)
        status.postBroadcastMessage(broadcastembed, discordClient, database)
      }
    }
  }
}
module.exports = event
