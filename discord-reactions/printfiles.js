const admin = false
const master = false
const Discord = require('discord.js')
const path = require('path')

const id = Math.floor(Math.random() * 10_000) + 1
let wsConnection
let dcMessage
let requester
let pageUp = false
let currentPage = 1
const maxEntries = 10
const executeReaction = function (message, user, guild, emote, discordClient, websocketConnection) {
  requester = user
  dcMessage = message
  wsConnection = websocketConnection
  if (emote.name === '▶️') {
    pageUp = true
  } else if (emote.name === '◀️') {
    pageUp = false
  } else {
    return
  }
  const pages = message.embeds[0].author.name
  const currentPageString = pages.replace('Page ', '').split('/')[0]
  currentPage = Number.parseInt(currentPageString) - 1
  websocketConnection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${  id  }}`)
  websocketConnection.on('message', handler)
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  sendPage(messageJson)
  wsConnection.removeListener('message', handler)
}

function sendPage (allFiles) {
  let newpage = currentPage
  const maxpage = Math.ceil(allFiles.result.length / maxEntries).toFixed(0)
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

  dcMessage.edit(exampleEmbed)
}
module.exports = executeReaction
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
