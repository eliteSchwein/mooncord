const config = require('../config.json')
const discordDatabase = require('../discorddatabase')
const admin = false
const master = true
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  const database = discordDatabase.getGuildDatabase(guild)
  const args = command.split(' ')
  args.shift()
  if (args.length === 0) {
    channel.send('<@' + user.id + '> Missing Arguments! Usage:\n> ' + config.prefix + command + ' <RoleAsTag/UserAsTag>')
    return
  }
  if (args[0].startsWith('<@&')) {
    const roleid = args[0].replace('<@&', '').replace('>', '')
    if (typeof guild.roles.cache.get(roleid) === 'undefined') {
      channel.send('<@' + user.id + '> Invalid Role!')
      return
    }
    if (database.accessroles.includes(roleid)) {
      channel.send('<@' + user.id + '> the Role ' + args[0] + ' is already a Access Role!')
      return
    }
    database.accessroles.push(roleid)
    discordDatabase.updateDatabase(database, guild)
    channel.send('<@' + user.id + '> added the Role ' + args[0] + ' to the Access Roles!')

    return
  }
  if (args[0].startsWith('<@') || args[0].startsWith('<@!')) {
    const memberid = args[0].replace('<@!', '').replace('<@', '').replace('>', '')
    if (typeof guild.members.cache.get(memberid) === 'undefined') {
      channel.send('<@' + user.id + '> Invalid Member!')
      return
    }
    if (database.accessusers.includes(memberid)) {
      channel.send('<@' + user.id + '> the Member ' + args[0] + ' has already Access!')
      return
    }
    database.accessusers.push(memberid)
    discordDatabase.updateDatabase(database, guild)
    channel.send('<@' + user.id + '> the Member ' + args[0] + ' has now Access!')

    return
  }
  channel.send('<@' + user.id + '> Invalid Arguments! Usage:\n> ' + config.prefix + command + ' <RoleAsTag/UserAsTag>')
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
