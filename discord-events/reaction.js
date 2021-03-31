const config = require('../config.json')
const reactionHandlers = require('../discord-reactions')
const { database } = require('../utils')
const { discordClient, moonrakerClient } = require('../clients')
const enableEvent = function() {
  discordClient.getClient().on('messageReactionAdd', handler)
}
function handler (messageReaction) {
  if (messageReaction.me) {
    return
  }
  const { message } = messageReaction
  if (message.author.id !== discordClient.getClient().user.id) {
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
  reactionModule(message, user, guild, messageReaction.emoji, discordClient.getClient(), moonrakerClient.getConnection())
}
function isAdmin (user, guild) {
  const guilddatabase = database.getGuildDatabase(guild)
  const member = guild.member(user)
  if (user.id === config.masterid) {
    return true
  }
  if (guilddatabase.adminusers.includes(user.id)) {
    return true
  }
  for (const memberole in member.roles.cache) {
    if (guilddatabase.adminroles.includes(memberole)) {
      return true
    }
  }
  return false
}
function isAllowed (user, guild) {
  const guilddatabase = database.getGuildDatabase(guild)
  const member = guild.member(user)
  if (guilddatabase.accesseveryone === true) {
    return true
  }
  if (isAdmin(user, guild)) {
    return true
  }
  if (guilddatabase.accessusers.includes(user.id)) {
    return true
  }
  for (const memberole in member.roles.cache) {
    if (guilddatabase.accessroles.includes(memberole)) {
      return true
    }
  }
  return false
}
module.exports = enableEvent
