const Discord = require('discord.js')

const { database, variables, webcam } = require('./index')
const test = require('./variablesUtil')
const { discordClient } = require('../clients') 
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
    const statusEvent = status[test.getStatus()]
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
  const guildsdatabase = database.getDatabase()
  if (typeof channel === 'undefined') {
    for (const guildid in guildsdatabase) {
      discordClient.guilds.fetch(guildid)
        .then(async (guild) => {
          const guilddatabase = guildsdatabase[guild.id]
          const broadcastchannels = guilddatabase.statuschannels
          for (const index in broadcastchannels) {
            const channel = guild.channels.cache.get(broadcastchannels[index])
            channel.send(message)
          }
        })
        .catch((error) => { console.log(error) })
    }
  } else {
    channel.send(message)
  }
}
