const discordDatabase = require('../discorddatabase')
const webcamUtil = require('../utils/webcamUtil')
const thumbnailUtil = require('../utils/thumbnailUtil')
const Discord = require('discord.js')
const variables = require('../utils/variablesUtil')

const getModule = async function (discordClient, channel, guild, user) {
  const database = discordDatabase.getDatabase()
  discordClient.user.setActivity('stop Print', { type: 'LISTENING' })

  if (typeof channel === 'undefined') {
    for (const guildid in database) {
      discordClient.guilds.fetch(guildid)
        .then(async function (guild) {
          const guilddatabase = database[guild.id]
          const broadcastchannels = guilddatabase.statuschannels
          for (const index in broadcastchannels) {
            const channel = guild.channels.cache.get(broadcastchannels[index])
            await sendMessage(channel, user)
          }
        })
        .catch(console.error)
    }
  } else {
    await sendMessage(channel, user)
  }
}

async function sendMessage (channel, user) {
  const snapshot = await webcamUtil.retrieveWebcam()
  const thumbnail = await thumbnailUtil.retrieveThumbnail()
  const statusEmbed = new Discord.MessageEmbed()
    .setColor('#c90000')
    .setTitle('Print Stopped')
    .setAuthor(variables.getCurrentFile())
    .addField('Progress', variables.getProgress().toFixed(0) + '%', true)
    .attachFiles([snapshot, thumbnail])
    .setImage(url = 'attachment://' + snapshot.name)
    .setThumbnail(url = 'attachment://' + thumbnail.name)
    .setTimestamp()

  if (typeof (user) === 'undefined') {
    statusEmbed.setFooter('Automatic')
  } else {
    statusEmbed.setFooter(user.tag, user.avatarURL())
  }

  channel.send(statusEmbed)
}
module.exports = getModule
