const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const logSymbols = require('log-symbols')

const args = process.argv.slice(2)

const discordClient = require('../clients/discordClient')
 
const config = require(`${args[0]}/mooncord.json`)
const database = require('./databaseUtil')
const locale = require('./localeUtil')
const messagemetadata = require('./status_meta_data.json')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')
const webcam = require('./webcamUtil')

function getCurrentDatabase(altdatabase){
  if(typeof(altdatabase) !== 'undefined'){
    return altdatabase
  }
  return database
}

function getDiscordClient(altdiscordClient){
  if (typeof (altdiscordClient) !== 'undefined') {
    return altdiscordClient
  }
  return discordClient.getClient()
}

async function triggerStatusUpdate(altdiscordClient) {

  const client = getDiscordClient(altdiscordClient)

  const currentStatus = variables.getStatus()

  await waitUntil(() => client.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })
  console.log(logSymbols.info, `Printer Status: ${currentStatus}`.printstatus)

  const parsedConfig = parseConfig(currentStatus)

  const embed = await generateEmbed(parsedConfig)

  if (typeof (parsedConfig.activity) !== 'undefined') {
    client.user.setActivity(
      parsedConfig.activity.text,
      { type: parsedConfig.activity.type }
    )
  }
  postStatus(embed, client)
  notifyStatus(embed, client)
  return true
}

function parseConfig(status) {
  const config = messagemetadata[status]
  const localeConfig = locale.status[status]
  const parsedConfig = JSON.stringify(config) 
    .replace(/(\${locale.title})/g, localeConfig.title)
    .replace(/(\${locale.activity})/g, localeConfig.activity)
    .replace(/(\${locale.print_time})/g, locale.status.fields.print_time)
    .replace(/(\${locale.print_layers})/g, locale.status.fields.print_layers)
    .replace(/(\${locale.eta_print_time})/g, locale.status.fields.eta_print_time)
    .replace(/(\${locale.print_progress})/g, locale.status.fields.print_progress)
    .replace(/(\${gcode_file})/g, variables.getCurrentFile())
    .replace(/(\${value_print_time})/g, variables.getFormatedPrintTime())
    .replace(/(\${value_eta_print_time})/g, variables.getFormatedRemainingTime())
    .replace(/(\${value_print_progress})/g, variables.getProgress())
    .replace(/(\${value_current_layer})/g, variables.getCurrentLayer())
    .replace(/(\${value_max_layer})/g, variables.getMaxLayers())

  return JSON.parse(parsedConfig)
}

async function generateEmbed(config, user) {
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

function postStatus(message, altdiscordClient, altdatabase) {
  const client = getDiscordClient(altdiscordClient)

  const maindatabase = getCurrentDatabase(altdatabase)
  const botdatabase = maindatabase.getDatabase()
  const ramdatabase = maindatabase.getRamDatabase()
  
  for (const guildid in botdatabase.guilds) {
    client.guilds.fetch(guildid)
      .then(async (guild) => {
        const guilddatabase = botdatabase.guilds[guild.id]
        for (const index in guilddatabase.broadcastchannels) {
          const channel = await client.channels.fetch(guilddatabase.broadcastchannels[index])
          if (config.status.use_percent &&
            message.title === locale.status.printing.title) {
            if (ramdatabase.cooldown === 0) {
              await removeOldStatus(channel, client)
              channel.send(message)
              maindatabase.updateRamDatabase("cooldown", config.status.min_interval)
            }
          } else {
            channel.send(message)
          }
        }
      })
      .catch((error) => { console.log(logSymbols.error, `Status Util: ${error}`.error) })
  }
}

async function removeOldStatus(channel, discordClient) {
  const lastMessage = await channel.messages.fetch({ limit: 1 }).first()

  if (lastMessage.author.id !== discordClient.user.id) { return }
  if (lastMessage.embeds.size === 0) { return }
  if (lastMessage.embeds.title !== locale.status.printing.title) { return }

  await lastMessage.delete()
}

function notifyStatus(message, altdiscordClient, altdatabase) {
  const client = getDiscordClient(altdiscordClient)

  const maindatabase = getCurrentDatabase(altdatabase)
  const botdatabase = maindatabase.getDatabase()
  const ramdatabase = maindatabase.getRamDatabase()

  const notifylist = botdatabase.notify

  for (const notifyindex in notifylist) {
    const clientid = notifylist[notifyindex]
    client.users.fetch(clientid)
      .then(async (user) => {
        if (config.status.use_percent &&
              message.title === locale.status.printing.title) {
          if (ramdatabase.cooldown === 0) {
            await removeOldStatus(user.dmChannel, client)
            user.send(message).catch('console.error')
            maindatabase.updateRamDatabase("cooldown", config.status.min_interval)
          }
        } else {
          user.send(message).catch('console.error')
        }
      })
      .catch((error) => { console.log(logSymbols.error, `Status Util: ${error}`.error) })
  }
}

module.exports.triggerStatusUpdate = async function (altdiscordClient) {
  await triggerStatusUpdate(altdiscordClient)
}

module.exports.getManualStatusEmbed = async function (user) {
  const currentStatus = variables.getStatus()
  const parsedConfig = parseConfig(currentStatus)
  return await generateEmbed(parsedConfig, user)
}

module.exports.postBroadcastMessage = (message, altdiscordClient, altdatabase, altramdatabase) => {
  postStatus(message, altdiscordClient, altdatabase, altramdatabase)
  notifyStatus(message, altdiscordClient, altdatabase, altramdatabase)
}
