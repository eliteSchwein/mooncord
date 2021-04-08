const config = require('../config.json')
const database = require('./databaseUtil')
const discordClient = require('../clients/discordclient')

module.exports.hasAdmin = async function (user, guildid, altdiscordClient) {
  if (user.id === config.masterid) {
    return true
  }
  if (typeof (guildid) === 'undefined') {
    return false
  }
  let client
  if (typeof (altdiscordClient) !== 'undefined') {
    client = altdiscordClient
  } else {
    client = discordClient.getClient()
  }
  let guild = guildid
  if (typeof (guildid) === 'string') {
    guild = await client.guilds.fetch(guildid)
  }
  const guilddatabase = database.getGuildDatabase(guild)
  if (guilddatabase.adminusers.includes(user.id)) {
    return true
  }
  const member = await guild.members.fetch(user.id)
  if (guilddatabase.adminroles.some(role => member.roles.cache.has(role))) {
    return true
  }
  return false
}

module.exports.isMaster = function (user) {
  return user.id === config.masterid
}
