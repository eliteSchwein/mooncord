const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const locale = require('./localeUtil')
const webcam = require('./webcamUtil')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')

const maxEntries = 5

module.exports = {}


module.exports.generateStatusEmbed = async (config) => {
  const snapshot = await webcam.retrieveWebcam()
  const embed = new Discord.MessageEmbed()
    .setColor(config.color)
    .setTitle(config.title)
    .attachFiles([snapshot])
    .setImage(`attachment://${snapshot.name}`)
  
  if (typeof (config.author) !== 'undefined') {
    embed.setAuthor(config.author)
  }
  
  if (config.thumbnail) {
    const thumbnailpic = await thumbnail.retrieveThumbnail()
    embed
      .attachFiles([thumbnailpic])
      .setThumbnail(`attachment://${thumbnailpic.name}`)
  }

  if (typeof (config.fields) !== 'undefined') {
    for (const index in config.fields) {
      embed.addField(config.fields[index].name, config.fields[index].value, true)
    }
  }
  if (config.versions) {
    const currentVersions = variables.getVersions()
    for (const component in currentVersions) {
      if (component !== 'system') {
        const componentdata = currentVersions[component]
        let {version} = componentdata
        if (version !== componentdata.remote_version) {
          version = version.concat(` **(${componentdata.remote_version})**`)
        }
        embed.addField(component, version, true)
      }
    }
  }
  
  embed.setTimestamp()
  
  return embed
}
module.exports.getWaitEmbed = (user, relation, icon) => {

  const title = locale.misc.wait_related
    .replace(/(\${relation})/g, relation)

  const waitEmbed = new Discord.MessageEmbed()
    .setColor('#c90000')
    .setDescription(`🕐 ${locale.misc.please_wait}`)
  
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
      .setAuthor(title, `attachment://${icon}`)
      .attachFiles(thumbnail)
  }
  
  return waitEmbed
}
module.exports.hasMessageEmbed = (message) => {
  if (message.channel.type !== 'text' && message.channel.type !== 'dm') {
    return false
  }
  if (message.embeds.length === 0) {
    return false
  }
  return true
}
module.exports.generateWarnEmbed = (title, description) => {
  return new Discord.MessageEmbed()
    .setColor('#fcad03')
    .setTitle(title)
    .attachFiles(path.resolve(__dirname, '../images/warning.png'))
    .setThumbnail('attachment://warning.png')
    .setTimestamp()
    .setDescription(description)
}
module.exports.retrieveCurrentPage = (embed) => {
  const pages = embed.author.name
  const currentPageString = pages.replace('Page ', '').split('/')[0]
  return Number.parseInt(currentPageString) - 1
}
module.exports.generatePageEmbed = (pageUp, currentPage, data, title, icon, user) => {
  let newpage = currentPage
  const maxpage = Math.ceil((data.length / maxEntries) - 0.1)
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
      entries = entries.concat(`${data[i].path}\n`)
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
