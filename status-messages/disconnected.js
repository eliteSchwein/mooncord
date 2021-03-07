const discordDatabase = require('../discorddatabase')
const webcamUtil = require('../utils/webcamUtil')
const Discord = require('discord.js')

const getModule = async function (discordClient, channel, guild, user) {
  const database = discordDatabase.getDatabase()
  discordClient.user.setActivity('wait for Klipper', { type: 'LISTENING' })

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
  const statusEmbed = new Discord.MessageEmbed()
    .setColor('#c90000')
    .setTitle('Printer Disconnected!')
    .attachFiles(snapshot)
    .setImage(url = 'attachment://' + snapshot.name)
    .setTimestamp()

  if (typeof (user) === 'undefined') {
    statusEmbed.setFooter('Automatic')
  } else {
    statusEmbed.setFooter(user.tag, user.avatarURL())
  }

  channel.send(statusEmbed)
}
module.exports = getModule
