const discordDatabase = require('../discorddatabase')

const admin = true
const master = false
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  const database = discordDatabase.getGuildDatabase(guild)
  if (database.statuschannels.includes(channel.id)) {
    channel.send(`<@${  user.id  }> This Channel is already a Broadcast Channel!`)
    return
  }
  database.statuschannels.push(channel.id)
  discordDatabase.updateDatabase(database, guild)
  channel.send(`<@${  user.id  }> This Channel is now a Broadcast Channel!`)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
