const config = require('../config.json')
const discordDatabase = require('../discorddatabase')
const core = require('../mooncord')

module.exports.hasAdmin = async function (user, guildid) {
  if (user.id === config.masterid) {
    return true
  }
  const guild = await core.getDiscordClient().guilds.fetch(guildid)
  const database = discordDatabase.getGuildDatabase(guild)
  if (database.adminusers.includes(user.id)) {
    return true
  }
  const member = await guild.members.fetch(user.id)
  for (const memberole in member.roles.cache) {
    if (database.adminroles.includes(memberole)) {
      return true
    }
  }
  return false
}
