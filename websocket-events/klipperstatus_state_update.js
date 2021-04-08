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
        if (software === 'system') {
          if (softwareinfo.package_count !== 0 && (typeof (variables.getVersions()) === 'undefined' || softwareinfo.package_count !== variables.getVersions()[software].package_count)) {
            diffVersions.system = softwareinfo.package_count
          }
        } else {
          if (softwareinfo.version !== softwareinfo.remote_version && (typeof (variables.getVersions()) === 'undefined' || softwareinfo.remote_version !== variables.getVersions()[software].remote_version)) {
            diffVersions[software] = {
              'current': softwareinfo.version,
              'remote': softwareinfo.remote_version
            }
          }
        }
      }
      postUpdate(diffVersions, discordClient, database)
      variables.setVersions(result.version_info)
    }
  }
}
function postUpdate(updateData, discordClient, database) {
  if (updateData.length === 0) { return }
  console.log(logSymbols.info, `There are some Updates!`.printstatus)
  const notifyembed = new Discord.MessageEmbed()
    .setColor('#fcf803')
    .setTitle('Systemupdates')
    .attachFiles(path.resolve(__dirname, '../images/update.png'))
    .setThumbnail('attachment://update.png')
    .setTimestamp()
  console.log(updateData.system)
  if (typeof (updateData.system) !== 'undefined') {
    notifyembed.addField('System', `Packages: ${updateData.system}`, true)
    updateData.system = undefined
  }
  for (const software in updateData) {
    console.log(software)
    notifyembed.addField(software, `${updateData[software].current} \n🆕 ${updateData[software].remote}`, true)
  }
  status.postBroadcastMessage(notifyembed, discordClient, database)
  
}
module.exports = event
