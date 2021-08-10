const Discord = require('discord.js')
const logSymbols = require('log-symbols')
const path = require('path')

const locale = require('../utils/localeUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient, database) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson
  if (typeof (result) !== 'undefined' && typeof (result.version_info) !== 'undefined') {
    const diffVersions = {}
    for (const software in result.version_info) {
      const softwareinfo = result.version_info[software]
      const difference = getDifference(software, softwareinfo)
      if (typeof (difference) !== 'undefined') {
        diffVersions[software] = difference
      }
    }
    variables.setVersions(result.version_info)
    postUpdate(diffVersions, discordClient, database)
  }
}

function getDifference(software, softwareinfo) {
  if (software === 'system') {
    if (softwareinfo.package_count === 0) { return }

    let oldPackageAmount = 0

    if (Object.keys(variables.getVersions()).length > 0) {
      oldPackageAmount = variables.getVersions()[software].package_count
    }

    if (softwareinfo.package_count !== oldPackageAmount) {
      return {
        'packages': softwareinfo.package_count
      }
    }
  } else {
    if (softwareinfo.version === softwareinfo.remote_version) { return }

    let oldVersionData = ''

    if (typeof (variables.getVersions()[software]) !== 'undefined') {
      oldVersionData = variables.getVersions()[software].remote_version
    }
    
    if (softwareinfo.remote_version !== oldVersionData) {
      return {
        'current': softwareinfo.version,
        'remote': softwareinfo.remote_version
      }
    }
  }
}

async function postUpdate(updateData, discordClient, database) {
  if (Object.keys(updateData).length === 0) { return }
  console.log(logSymbols.info, `There are some Updates!`.printstatus)
  const notifyEmbed = new Discord.MessageEmbed()
    .setColor('#fcf803')
    .setTitle(locale.update.title)
    .attachFiles(path.resolve(__dirname, '../images/update.png'))
    .setThumbnail('attachment://update.png')
    .setTimestamp()
  for (const software in updateData) {
    if (software === 'system') {
      notifyEmbed.addField(locale.update.system, `${locale.update.packages}: ${updateData[software].packages}`, true)
    } else {
      notifyEmbed.addField(software, `${updateData[software].current} \n🆕 ${updateData[software].remote}`, true)
    }
  }
  const buttonRow = []
  //const button = new MessageButton()
   // .setStyle('grey')
    //.setID('update_system')
   // .setLabel(locale.buttons.update_system)
  //buttonRow.push(button)

  status.postBroadcastMessage({ embed: notifyEmbed, buttons: buttonRow }, discordClient, database)
}
module.exports = event
