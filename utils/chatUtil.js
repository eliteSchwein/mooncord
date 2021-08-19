const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

const locale = require('./localeUtil')
const webcam = require('./webcamUtil')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')

const pageMeta = require('./pages_meta.json')

const maxEntries = 5

function getButtons(config) {
  if (Object.keys(config.buttons).length === 0) {
    return undefined
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

module.exports.generateStatusEmbed = async (config) => {
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

  const buttons = getButtons(config)

  if(typeof(buttons) !== 'undefined') {
    components.push(buttons)
  }
  
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
  
  return { embeds: [waitEmbed], components: [] }
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
module.exports.generatePageEmbed = (pageUp, currentPage, data, title, icon, addFile) => {
  let newpage = currentPage
  const maxpage = Math.floor(data.length / maxEntries)
  const selectRow = new Discord.MessageActionRow()
  const selectList = new Discord.MessageSelectMenu()
    .setCustomId('view_printjob')
    .setPlaceholder(locale.selection.printlist_more_details.placeholder)

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
  const convertedMaxEntries = maxEntries - 1
  for (let i = (newpage * convertedMaxEntries) + newpage;
    i <= convertedMaxEntries + (newpage * convertedMaxEntries) + newpage;
    i++) {
    if (i < data.length) {
      entries = entries.concat(`${data[i].path}\n`)
      selectList.addOptions([{
							label: data[i].path,
							description: locale.selection.printlist_more_details.description
                .replace(/(\${gcode_file})/g, data[i].path),
							value: data[i].path,
      }])
    }
  }

  selectRow.addComponents(selectList)

  const imgPath = path.resolve(__dirname, `../images/${icon}`)
  const thumbnail = new Discord.MessageAttachment(imgPath, icon)

  const components = []
  const files = []

  if(addFile) { files.push(thumbnail) }

  const buttons = getButtons(pageMeta)

  components.push(selectRow)
  components.push(buttons)

  const pageEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setAuthor(`Page ${newpage + 1}/${maxpage}`)
    .setDescription(entries)
    .setThumbnail(`attachment://${icon}`)

  return { embeds: [pageEmbed], files: files, components: components }
}
