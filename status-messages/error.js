const statusUtil = require('../utils/statusUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, guild, user) {
  const database = discordDatabase.getDatabase()
  discordClient.user.setActivity('wait for User', { type: 'LISTENING' })

  const statusEmbed = statusUtil.getDefaultEmbed(user,'Printer Ready','#0099ff')
  statusEmbed
    .addField('Mooncord Version', pjson.version, true)
    .addField('Moonraker Version', moonrakerver, true)
    .addField('Klipper Version', klipperver, true)
    .attachFiles(snapshot)
    .setImage(`attachment://${  snapshot.name}`)

  statusUtil.postStatus(discordClient,statusEmbed,channel)

  if (typeof channel === 'undefined') {
    for (const guildid in database) {
      discordClient.guilds.fetch(guildid)
        .then(async (guild) => {
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
    .setTitle('A Error occured!')
    .attachFiles(snapshot)
    .setImage(`attachment://${  snapshot.name}`)
    .setTimestamp()

  if (typeof (user) === 'undefined') {
    statusEmbed.setFooter('Automatic')
  } else {
    statusEmbed.setFooter(user.tag, user.avatarURL())
  }

  channel.send(statusEmbed)
}
module.exports = getModule
