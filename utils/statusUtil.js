const Discord = require('discord.js')

const discordDatabase = require('../discorddatabase')
const status = require('../status-messages')
const variables = require('../utils/variablesUtil')

async function triggerStatusUpdate (discordClient, channel, user) {
  console.log(`Printer Status: ${variables.getStatus()}`)
  const statusEvent = status[variables.getStatus()]
  setTimeout(async () => {
    const embed = await statusEvent(discordClient, channel, user)
    postStatus(discordClient, embed, channel)
  }, 1000)
}

module.exports.triggerStatusUpdate = async function (discordClient, channel, user) {
  await triggerStatusUpdate(discordClient, channel, user)
}

module.exports.getManualStatusEmbed = function (discordClient) {
    const statusEvent = status[variables.getStatus()]
    const embed = statusEvent(discordClient, channel, user)
    return embed
}

module.exports.getDefaultEmbed = function (user, status, color) {
  const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(status)
    .setTimestamp()

  if (typeof (user) === 'undefined') {
    embed.setFooter('Automatic')
  } else {
    embed.setFooter(user.tag, user.avatarURL())
  }

  return embed
}

function postStatus(discordClient, message, channel) {
  const database = discordDatabase.getDatabase()
  if (typeof channel === 'undefined') {
    for (const guildid in database) {
      discordClient.guilds.fetch(guildid)
        .then(async (guild) => {
          const guilddatabase = database[guild.id]
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
