const config = require('../config.json')
const database = require('./databaseUtil')
let discordClient = require('../clients/discordclient')

module.exports.hasAdmin = async function (user, guildid, altdiscordClient) {
  if (user.id === config.masterid) {
    return true
  }
  console.log(altdiscordClient)
  if (typeof (altdiscordClient) !== 'undefined') {
    discordClient = altdiscordClient
  }
  const guild = await discordClient.getClient().guilds.fetch(guildid)
  const guilddatabase = database.getGuildDatabase(guild)
  if (guilddatabase.adminusers.includes(user.id)) {
    return true
  }
  const member = await guild.members.fetch(user.id)
  for (const memberole in member.roles.cache) {
    if (guilddatabase.adminroles.includes(memberole)) {
      return true
    }
  }
  return false
}

module.exports.isMaster = function (user) {
  return user.id === config.masterid
}
