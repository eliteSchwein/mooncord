const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const locale = require('./localeUtil')
const webcam = require('./webcamUtil')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')

const maxEntries = 5

function getButtons(config) {
  if (Object.keys(config.buttons).length === 0) {
    return
  }
  const row = new Discord.MessageActionRow()
  
  for (const index in config.buttons) {
    const buttonMeta = config.buttons[index]
    const button = new Discord.MessageButton()
      .setCustomId(buttonMeta.id)
      .setLabel(locale.buttons[buttonMeta.id])
      .setStyle(buttonMeta.style)

    if(buttonMeta.emoji !== '') { 
      button.setEmoji(buttonMeta.emoji)
    }
    row.addComponents(button)
  }
  return row
}

module.exports = {}

module.exports.getButtons = (config) => { return getButtons(config) }

module.exports.generateStatusEmbed = async (config, withButtons) => {
  const snapshot = await webcam.retrieveWebcam()

  const files = []

  const components = []

  files.push(snapshot)
  
  const embed = new Discord.MessageEmbed()
    .setColor(config.color)
    .setTitle(config.title)
    .setImage(`attachment://${snapshot.name}`)
  
  if (typeof (config.author) !== 'undefined') {
    embed.setAuthor(config.author)
  }
  
  if (config.thumbnail) {
    const thumbnailpic = await thumbnail.retrieveThumbnail()
    files.push(thumbnailpic)
    embed
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

  if(withButtons) {
    components.push(getButtons(config))
  }

  console.log(components)
  
  return { embeds: [embed], files: files, components: components }
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
    waitEmbed
      .setAuthor(title, `attachment://${icon}`)
  }
  
  return { embeds: [waitEmbed] }
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
  const embed = new Discord.MessageEmbed()
    .setColor('#fcad03')
    .setTitle(title)
    .setThumbnail('attachment://warning.png')
    .setTimestamp()
    .setDescription(description)
  
  const icon = new Discord.MessageAttachment(path.resolve(__dirname, '../images/warning.png'), 'warning.png')
  
  return { embeds: [embed], files: [icon] }
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
    .setThumbnail(`attachment://${icon}`)
  
  if (typeof (user) !== 'undefined') {
    pageEmbed
      .setTimestamp()
      .setFooter(user.tag, user.avatarURL())
  }

  return { embeds: [pageEmbed], files: [thumbnail] }
}
