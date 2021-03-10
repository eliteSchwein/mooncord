const fs = require('fs')
const path = require('path')

const config = require('../config.json')
const discordDatabase = require('../discorddatabase')
const commands = require('../discord-commands')

const enableEvent = function (discordClient, websocketConnection) {
  discordClient.on('message', msg => {
    if (msg.channel.type === 'dm') {
      msg.author.send('DM is not Supportet!')
      return
    }
    if (msg.channel.type !== 'text') {
      return
    }
    const command = msg.toString().slice(config.prefix.length)
    if(command.startsWith('index')){
      channel.send(`<@${  user.id  }> The following Command couldn´t be found! \n> ${  config.prefix  }${command.split(' ')[0]  }\n use ${  config.prefix  }help`)
      return
    }
    try {
      if (!fs.existsSync(path.resolve(__dirname, `../discord-commands/${command.toLowerCase().split(' ')[0]  }.js`))) {
        channel.send(`<@${  user.id  }> The following Command couldn´t be found! \n> ${  config.prefix  }${command.split(' ')[0]  }\n use ${  config.prefix  }help`)
        return
      }
    } catch (error) {
      console.error(error)
    }
    const commandModule = commands[command.split(' ')[0]]
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
    if (msg.toString().startsWith(config.prefix)) {
      commandHandler(msg.toString().slice(config.prefix.length), msg.channel, msg.author, msg.channel.guild, discordClient, websocketConnection)
    }
    commandModule(command, channel, user, guild, discordClient, websocketConnection)
  })
}
module.exports = enableEvent

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
