const admin = true
const master = false
const Discord = require('discord.js')
const path = require('path')

const id = Math.floor(Math.random() * 10_000) + 1
let wsConnection
let messageChannel
let requester
const pageUp = false
const currentPage = 1
const maxEntries = 10
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  requester = user
  messageChannel = channel
  wsConnection = websocketConnection
  channel.startTyping()
  websocketConnection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${  id  }}`)

  websocketConnection.on('message', handler)
  channel.stopTyping()
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  sendPage(messageJson)
  wsConnection.removeListener('message', handler)
}

function sendPage (allFiles) {
  if (allFiles.result.length > 0) {
    messageChannel.send(`<@${  requester.id  }> There are currently no GCode aviable!`)
    return
  }
  let newpage = currentPage
  const maxpage = (allFiles.result.length / maxEntries).toFixed(0)
  if (pageUp) {
    if (currentPage !== maxpage - 1) {
      newpage = currentPage + 1
    }
  } else {
    if (currentPage !== 0) {
      newpage = currentPage - 1
    }
  }
  let entries = '\n'
  for (let i = (newpage * maxEntries) + newpage; i <= maxEntries + (newpage * maxEntries) + newpage; i++) {
    if (i < allFiles.result.length) {
      entries = entries.concat(`${allFiles.result[i].filename  }\n`)
    }
  }
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Print Files')
    .setAuthor(`Page ${  newpage + 1  }/${  maxpage}`)
    .setDescription(entries)
    .attachFiles(path.resolve(__dirname, '../images/printlist.png'))
    .setThumbnail('attachment://printlist.png')
    .setTimestamp()
    .setFooter(requester.tag, requester.avatarURL())

  messageChannel.send(exampleEmbed)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
