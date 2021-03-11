const config = require('../config.json')
const reactionHandlers = require('../discord-reactions')
const discordDatabase = require('../discorddatabase')

let wsConnection
let dcClient
const enableEvent = function (discordClient, websocketConnection) {
  wsConnection = websocketConnection
  dcClient = discordClient
  discordClient.on('messageReactionAdd', handler)
}
function handler (messageReaction) {
  if (messageReaction.me) {
    return
  }
  const { message } = messageReaction
  if (message.author.id !== dcClient.user.id) {
    return
  }
  const user = messageReaction.users.cache.array()[1]
  const { guild } = message
  if (message.embeds.length === 0) {
    return
  }
  messageReaction.users.remove(user)
  const id = message.embeds[0].title.toLowerCase().replace(/\s/g, '')
  const reactionModule = reactionHandlers[id]
  if (reactionModule.needMaster() && user.id !== config.masterid) {
    message.channel.send(`<@${user.id}> You are not allowed to execute this Action! \n> ${message.embeds[0].title}`)
    return
  }
  if (reactionModule.needAdmin() && !isAdmin(user, guild)) {
    message.channel.send(`<@${user.id}> You are not allowed to execute this Action! \n> ${message.embeds[0].title}`)
    return
  }
  if (!isAllowed(user, guild)) {
    message.channel.send(`<@${user.id}> You are not allowed to execute this Action! \n> ${message.embeds[0].title}`)
    return
  }
  reactionModule(message, user, guild, messageReaction.emoji, dcClient, wsConnection)
}

function isAdmin (user, guild) {
  const database = discordDatabase.getGuildDatabase(guild)
  const member = guild.member(user)
  if (user.id === config.masterid) {
    return true
  }
  if (database.adminusers.includes(user.id)) {
    return true
  }
  for (const memberole in member.roles.cache) {
    if (database.adminroles.includes(memberole)) {
      return true
    }
  }
  return false
}
function isAllowed (user, guild) {
  const database = discordDatabase.getGuildDatabase(guild)
  const member = guild.member(user)
  if (database.accesseveryone === true) {
    return true
  }
  if (isAdmin(user, guild)) {
    return true
  }
  if (database.accessusers.includes(user.id)) {
    return true
  }
  for (const memberole in member.roles.cache) {
    if (database.accessroles.includes(memberole)) {
      return true
    }
  }
  return false
}
module.exports = enableEvent
