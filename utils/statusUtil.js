const Discord = require('discord.js')

const database = require('./databaseUtil')
const variables = require('./variablesUtil')
const webcam = require('./webcamUtil')

const discordClient = require('../clients/discordclient') 
const status = require('../status-messages')

async function triggerStatusUpdate (channel, user) {
  console.log(`Printer Status: ${variables.getStatus()}`)
  const statusEvent = status[variables.getStatus()]
  setTimeout(async () => {
    const embed = await statusEvent( user)
    postStatus(embed, channel)
  }, 1000)
}

module.exports.triggerStatusUpdate = async function (channel, user) {
  await triggerStatusUpdate(channel, user)
}

module.exports.getManualStatusEmbed = async function (user) {
    const statusEvent = status[variables.getStatus()]
    const embed = statusEvent(user)
    return embed
}

module.exports.getDefaultEmbed = async function (user, status, color) {
  const snapshot = await webcam.retrieveWebcam()
  const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(status)
    .attachFiles([snapshot])
    .setImage(`attachment://${snapshot.name}`)

  if (typeof (user) === 'undefined') {
    embed.setFooter('Automatic')
    embed.setTimestamp()
  }

  return embed
}

function postStatus(message, channel) {
  const botdatabase = database.getDatabase()
  console.log(botdatabase)
  if (typeof channel === 'undefined') {
    for (const guildid in botdatabase.guilds) {
      discordClient.getClient().guilds.fetch(guildid)
        .then(async (guild) => {
          const guilddatabase = botdatabase.guilds[guild.id]
          for (const index in guilddatabase.broadcastchannels) {
            const channel = guild.channels.cache.get(guilddatabase.broadcastchannels[index])
            channel.send(message)
          }
        })
        .catch((error) => { console.log(error) })
    }
  } else {
    channel.send(message)
  }
}
