const config = require('../config.json')
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js')
const fs = require('fs')
const id = Math.floor(Math.random() * 10000) + 1
let wsConnection
let messageChannel
let requester
let file
let dcClient
const executeCommand = async function (command, channel, user, guild, discordClient, websocketConnection) {
  requester = user
  messageChannel = channel
  wsConnection = websocketConnection
  dcClient = discordClient
  const args = command.split(' ')
  args.shift()
  if (args.length == 0) {
    channel.send('<@' + user.id + '> Missing Arguments! Usage:\n> ' + config.prefix + command + ' PrintFile')
    return
  }
  let printfile = args[0]
  if (!printfile.endsWith('.gcode')) {
    printfile = printfile + '.gcode'
  }
  file = printfile
  websocketConnection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "' + printfile + '"}, "id": ' + id + '}')
  websocketConnection.on('message', handler)
}

async function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  if (typeof (messageJson.error) !== 'undefined') {
    wsConnection.removeListener('message', handler)
    messageChannel.send('<@' + requester.id + '> The File ' + file + " couldn't be found!")
    return
  }
  wsConnection.removeListener('message', handler)
  let thumbnail = ''
  let description = ''
  description = description.concat('Print Time: ' + formatDateTime(messageJson.result.estimated_time * 1000) + '\n')
  description = description.concat('Slicer: ' + messageJson.result.slicer + '\n')
  description = description.concat('Slicer Version: ' + messageJson.result.slicer_version + '\n')
  description = description.concat('Height: ' + messageJson.result.object_height + 'mm')
  if (typeof (messageJson.result.thumbnails) !== 'undefined') {
    thumbnail = messageJson.result.thumbnails[1].data
    fs.writeFile(__dirname + '/../temp/thumbnail' + file + '.png', thumbnail, 'base64', function (err) {
      if (err) {
        console.log(err)

        messageChannel.send('<@' + config.masterid + '> An error has occurred, Please Check the Console!')
      }
    })
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('File Informations')
      .setAuthor(file)
      .setDescription(description)
      .attachFiles(__dirname + '/../temp/thumbnail' + file + '.png')
      .setThumbnail(url = 'attachment://thumbnail' + file + '.png')
      .setTimestamp()
      .setFooter(requester.tag, requester.avatarURL())

    messageChannel.send(exampleEmbed)

    setTimeout(() => {
      fs.unlink(__dirname + '/../temp/thumbnail' + file + '.png', (err) => {
        if (err) {
          console.error(err)

          messageChannel.send('<@' + config.masterid + '> An error has occurred, Please Check the Console!')
        }
      })
    }, 500)
    return
  }
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('File Informations')
    .setAuthor(file)
    .setDescription(description)
    .setThumbnail()
    .setTimestamp()
    .setFooter(requester.tag, requester.avatarURL())

  messageChannel.send(exampleEmbed)
}

function formatDateTime (msec) {
  const date = new Date(msec)
  let hours = date.getHours()
  hours = hours - 1
  const h = hours >= 10 ? hours : '0' + hours
  const m = date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes()
  return h + ':' + m
}

module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
