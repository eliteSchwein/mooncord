const fs = require('fs')
const path = require('path')

const config = require('../config.json')
const commands = require('../discord-commands')
const discordDatabase = require('../discorddatabase')

const enableEvent = function (discordClient, websocketConnection) {
  discordClient.on('message', msg => {
    if (msg.channel.type === 'dm') {
      msg.author.send('DM is not Supportet!')
      return
    }
    if (msg.channel.type !== 'text') {
      return
    }
    if(!msg.toString().startsWith(config.prefix)){
      return
    }
    const command = msg.toString().slice(config.prefix.length)
    if(command.startsWith('index')){
      msg.channel.send(`<@${  msg.author.id  }> The following Command couldn´t be found! \n> ${  config.prefix  }${command.split(' ')[0]  }\n use ${  config.prefix  }help`)
      return
    }
    try {
      if (!fs.existsSync(path.resolve(__dirname, `../discord-commands/${command.toLowerCase().split(' ')[0]  }.js`))) {
        msg.channel.send(`<@${  msg.author.id  }> The following Command couldn´t be found! \n> ${  config.prefix  }${command.split(' ')[0]  }\n use ${  config.prefix  }help`)
        return
      }
    } catch (error) {
      console.error(error)
    }
    const commandModule = commands[command.split(' ')[0]]
    if (commandModule.needMaster() && msg.author.id !== config.masterid) {
      msg.channel.send(`<@${  msg.author.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
      return
    }
    if (commandModule.needAdmin() && !isAdmin(msg.author, msg.guild)) {
      msg.channel.send(`<@${  msg.author.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
        return
      }
    if (!isAllowed(msg.author, msg.guild)) {
      msg.channel.send(`<@${  msg.author.id  }> You are not allowed to execute the following Command! \n> ${  config.prefix  }${command.split(' ')[0]}`)
      return
    }
    commandModule(command, msg.channel, msg.author, msg.guild, discordClient, websocketConnection)
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
