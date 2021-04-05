const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

const maxEntries = 5

module.exports = {}
module.exports.getWaitEmbed = function (user, icon) {

  const waitEmbed = new Discord.MessageEmbed()
    .setColor('#c90000')
    .setDescription('🕐 Please Wait!')
  
  if (typeof (user) !== 'undefined') {
    waitEmbed
      .setTimestamp()
      .setFooter(user.tag, user.avatarURL())
  }

  if (typeof (icon) !== 'undefined') {
    const imgPath = path.resolve(__dirname, `../images/${icon}`)
    const imgBuffer = fs.readFileSync(imgPath)
    const thumbnail = new Discord.MessageAttachment(imgBuffer, icon)
    waitEmbed
      .setAuthor('Related', `attachment://${icon}`)
      .attachFiles(thumbnail)
  }
  
  return waitEmbed
}
module.exports.hasMessageEmbed = function (message) {
  if (message.channel.type !== 'text') {
    return false
  }
  if (message.embeds.length === 0) {
    return false
  }
  return true
}
module.exports.retrieveCurrentPage = function (embed) {
  const pages = embed.author.name
  const currentPageString = pages.replace('Page ', '').split('/')[0]
  return Number.parseInt(currentPageString) - 1
}
module.exports.generatePageEmbed = async function (pageUp, currentPage, data, title, icon, user) {
  let newpage = currentPage
  console.log(`${data.length} / ${maxEntries} ${Math.ceil(data.length / maxEntries).toFixed(0)}  ${(data.length / maxEntries).toFixed(0)}`)
  const maxpage = Math.ceil(data.length / maxEntries).toFixed(0)
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
    if (i < data.length) {
      entries = entries.concat(`${data[i].filename}\n`)
    }
  }

  const imgPath = path.resolve(__dirname, `../images/${icon}`)
  const imgBuffer = fs.readFileSync(imgPath)
  const thumbnail = new Discord.MessageAttachment(imgBuffer, icon)

  const pageEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setAuthor(`Page ${newpage + 1}/${maxpage}`)
    .setDescription(entries)
    .attachFiles(thumbnail)
    .setThumbnail(`attachment://${icon}`)
  
  if (typeof (user) !== 'undefined') {
    pageEmbed
      .setTimestamp()
      .setFooter(user.tag, user.avatarURL())
  }
  
  return pageEmbed
}
