const Discord = require('discord.js')

const discordDatabase = require('../discorddatabase')
const pjson = require('../package.json')
const variables = require('../utils/variablesUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, guild, user) {
  const database = discordDatabase.getDatabase()
  discordClient.user.setActivity('GCODE File...', { type: 'LISTENING' })

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
  const versions = variables.getVersions()
  const {moonraker} = versions
  const {klipper} = versions
  let moonrakerver = moonraker.version
  let klipperver = klipper.version
  if (moonrakerver !== moonraker.remote_version) {
    moonrakerver = moonrakerver.concat(` **(${  moonraker.remote_version  })**`)
  }
  if (klipperver !== klipper.remote_version) {
    klipperver = klipperver.concat(` **(${  klipper.remote_version  })**`)
  }
  const statusEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Printer Ready')
    .addField('Mooncord Version', pjson.version, true)
    .addField('Moonraker Version', moonrakerver, true)
    .addField('Klipper Version', klipperver, true)
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
