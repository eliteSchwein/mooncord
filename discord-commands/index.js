const fs = require('fs')
const path = require('path')

const config = require('../config.json')
const discordDatabase = require('../discorddatabase')

const executeCommands = function (command, channel, user, guild, discordClient, websocketConnection) {
  if (command.toLowerCase().startsWith('index')) {
    channel.send(`<@${  user.id  }> Ha you are so Funny (not)!`)
    return
  }
  try {
    if (!fs.existsSync(path.resolve(__dirname, `${command.toLowerCase().split(' ')[0]  }.js`))) {
      channel.send(`<@${  user.id  }> The following Command couldn´t be found! \n> ${  config.prefix  }${command.split(' ')[0]  }\n use ${  config.prefix  }help`)
      return
    }
  } catch (error) {
    console.error(error)
  }
  delete require.cache[require.resolve(`./${  command.split(' ')[0]}`)]
  const commandModule = require(`./${  command.split(' ')[0]}`)
  if (commandModule.needMaster() && user.id !== config.masterid) {
      channel.send(`<@${  user.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
      return
    }
  if (commandModule.needAdmin() && !isAdmin(user, guild)) {
      channel.send(`<@${  user.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
      return
    }
  if (!isAllowed(user, guild)) {
    channel.send(`<@${  user.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
    return
  }
  commandModule(command, channel, user, guild, discordClient, websocketConnection)
}
module.exports = executeCommands

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
