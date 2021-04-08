const Discord = require('discord.js')
const path = require('path')
const logSymbols = require('log-symbols');

const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')

const event = async (message, connection, discordClient, database) => {
  if (message.type === 'utf8') {
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
      postUpdate(diffVersions, discordClient, database)
      variables.setVersions(result.version_info)
    }
  }
}

function getDifference(software, softwareinfo) {
  if (software === 'system') {
    if (softwareinfo.package_count !== 0 &&
      (typeof (variables.getVersions()) === 'undefined' ||
        softwareinfo.package_count !== variables.getVersions()[software].package_count)) {
          console.log({
        'packages': softwareinfo.package_count
      })
      return {
        'packages': softwareinfo.package_count
      }
    }
  } else {
    if (softwareinfo.version !== softwareinfo.remote_version &&
      (typeof (variables.getVersions()) === 'undefined' ||
        softwareinfo.remote_version !== variables.getVersions()[software].remote_version)) {
          console.log({
        'current': softwareinfo.version,
        'remote': softwareinfo.remote_version
      })
      return {
        'current': softwareinfo.version,
        'remote': softwareinfo.remote_version
      }
    }
  }
  return undefined
}

function postUpdate(updateData, discordClient, database) {
  if (Object.keys(updateData).length === 0) { return }
  console.log(logSymbols.info, `There are some Updates!`.printstatus)
  const notifyembed = new Discord.MessageEmbed()
    .setColor('#fcf803')
    .setTitle('Systemupdates')
    .attachFiles(path.resolve(__dirname, '../images/update.png'))
    .setThumbnail('attachment://update.png')
    .setTimestamp()
  for (const software in updateData) {
    if (software === 'system') {
      notifyembed.addField('System', `Packages: ${updateData[software].packages}`, true)
    } else {
      notifyembed.addField(software, `${updateData[software].current} \n🆕 ${updateData[software].remote}`, true)
    }
  }
  status.postBroadcastMessage(notifyembed, discordClient, database)
}
module.exports = event
