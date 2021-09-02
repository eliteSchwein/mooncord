const Discord = require('discord.js')
const logSymbols = require('log-symbols')
const path = require('path')

const locale = require('../utils/localeUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

module.exports = async (message) => {
  if (message.type !== 'utf8') { return }
  const messageJson = JSON.parse(message.utf8Data)

  if (typeof (messageJson.method) === 'undefined') { return }
  if (messageJson.method !== 'notify_status_update') { return }

  if (typeof (messageJson.params) === 'undefined') { return }

  retrieveSoftwareVersion(messageJson.params[0])
}

function retrieveSoftwareVersion(result) {
  if (typeof (result) === 'undefined') { return }
  if (typeof (result.version_info) === 'undefined') { return }

  variables.setVersions(result.version_info)
  postUpdate(result.version_info, discordClient, database)
}

async function postUpdate(updateData, discordClient, database) {
  if (Object.keys(updateData).length === 0) { return }

  console.log(logSymbols.info, `There are some Updates!`.printstatus)

  const notifyEmbed = new Discord.MessageEmbed()
    .setColor('#fcf803')
    .setTitle(locale.update.title)
    .setThumbnail('attachment://update.png')
    .setTimestamp()
  
  const icon = new Discord.MessageAttachment(path.resolve(__dirname, '../images/update.png'))

  for (const software in updateData) {
    if (software === 'system') {
      notifyEmbed.addField(locale.update.system, `${locale.update.packages}: ${updateData[software].package_count}`, true)
    } else {
      notifyEmbed.addField(software, `${updateData[software].version} \n🆕 ${updateData[software].remote_version}`, true)
    }
  }
  
  const row = new Discord.MessageActionRow()
  
  const button = new Discord.MessageButton()
    .setCustomId('update_system')
    .setLabel(locale.buttons.update_system)
    .setStyle('SECONDARY')
  
  row.addComponents(button)

  status.postBroadcastMessage({ embeds: [notifyEmbed], files:[icon], components:[row] }, discordClient, database)
}
