const admin = false
const master = true
const Discord = require('discord.js')
const path = require('path')
let wsConnection
let invalidCommands = []
let unknownCommands = []
const executeReaction = function (message, user, guild, emote, discordClient, websocketConnection) {
  wsConnection = websocketConnection
  if (emote.name === '❌') {
    message.channel.send('<@' + user.id + '> You cancel the GCode executions!')
    message.delete()
    return
  }
  if (emote.name === '✅') {
    message.channel.send('<@' + user.id + '> The GCodes will be send to Moonraker!')
    let gcodeCommands = []
    invalidCommands = []
    unknownCommands = []
    gcodeCommands = message.embeds[0].description.split('`')
    gcodeCommands.shift()
    let results= gcodeCommands.filter(x => x.match(/[A-Za-z]/g));
    console.log(results);
    let gcodeTimer = 0
    let gcodePosition = 0
    gcodeTimer = setInterval(() => {
      if (gcodePosition === gcodeCommands.length) {
        if (unknownCommands.length !== 0 || invalidCommands.length !== 0) {
          if (unknownCommands.length !== 0) {
            let gcodeList = (unknownCommands.length) + ' GCode Commands are unknown:\n\n'
            for (let i = 0; i <= unknownCommands.length - 1; i++) {
              gcodeList = gcodeList.concat('`' + unknownCommands[i] + '` ')
            }
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor('#d60000')
              .setTitle('Unknown GCode Commands')
              .setDescription(gcodeList)
              .attachFiles(path.resolve(__dirname, '../images/execute.png'))
              .setThumbnail('attachment://execute.png')
              .setTimestamp()
              .setFooter(user.tag, user.avatarURL())

            message.channel.send(exampleEmbed)
          }
          if (invalidCommands.length !== 0) {
            let gcodeList = (invalidCommands.length) + ' GCode Commands are invalid (with Reason):\n\n'
            for (let i = 0; i <= invalidCommands.length - 1; i++) {
              gcodeList = gcodeList.concat('`' + invalidCommands[i] + '` ')
            }
            const exampleEmbed = new Discord.MessageEmbed()
              .setColor('#d60000')
              .setTitle('Invalid GCode Commands')
              .setDescription(gcodeList)
              .attachFiles(path.resolve(__dirname, '../images/execute.png'))
              .setThumbnail('attachment://execute.png')
              .setTimestamp()
              .setFooter(user.tag, user.avatarURL())

            message.channel.send(exampleEmbed)
          }
        } else {
          message.channel.send('<@' + user.id + '> all GCodes Commands executed successfully!')
        }
        clearInterval(gcodeTimer)
        return
      }
      const id = Math.floor(Math.random() * 10000) + 1
      console.log('Execute Command [' + (gcodePosition + 1) + '] ' + gcodeCommands[gcodePosition])
      websocketConnection.send('{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "' + gcodeCommands[gcodePosition] + '"}, "id": ' + id + '}')
      websocketConnection.on('message', handler)
      gcodePosition++
    }, 500)
    message.delete()
  }
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  if (messageJson.method === 'notify_gcode_response') {
    let command = ''
    if (messageJson.params[0].includes('Unknown command')) {
      command = messageJson.params[0].replace('// Unknown command:', '').replace(/"/g, '')
      unknownCommands.push(command)
      wsConnection.removeListener('message', handler)
    }
    if (messageJson.params[0].includes('Error')) {
      command = messageJson.params[0].replace('!! Error on ', '').replace(/'/g, '')
      invalidCommands.push(command)
      wsConnection.removeListener('message', handler)
    }
  }
  setTimeout(() => {
    wsConnection.removeListener('message', handler)
  }, 1000)
}

module.exports = executeReaction
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
