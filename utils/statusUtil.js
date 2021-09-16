const { waitUntil } = require('async-wait-until')
const logSymbols = require('log-symbols')
const Discord = require('discord.js')

const args = process.argv.slice(2)


const fs = require("fs");

const configData = fs.readFileSync(`${args[0]}/mooncord.json`, {encoding: 'utf8'})
const config = JSON.parse(configData)
const database = require('./databaseUtil')
const locale = require('./localeUtil')
const metadata = require('./status_meta_data.json')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')
const webcam = require('./webcamUtil')
const chatUtil = require('./chatUtil')

const statusWaitList = []

let currentStatus = "startup"

async function changeStatus(discordClient, newStatus) {
  const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
  const currentStatusMeta = metadata[currentStatus].meta_data
  const newStatusMeta = metadata[newStatus].meta_data

  if(!currentStatusMeta.allow_same && currentStatus === newStatus) { return false }
  if(currentStatusMeta.prevent.includes(newStatus)) { return false }
  if(currentStatusMeta.order_id > 0 && 
    newStatusMeta.order_id > 0 && 
    currentStatusMeta.order_id > newStatusMeta.order_id) { return false }

  statusWaitList.push(id)

  currentStatus = newStatus

  await waitUntil(() => statusWaitList[0] === id, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 2000 })

  await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })

  console.log(logSymbols.info, `Printer Status: ${newStatus}`.printstatus)
  
  const parsedConfig = parseConfig(newStatus)

  if (typeof (parsedConfig.activity) !== 'undefined') {
    discordClient.user.setActivity(
      parsedConfig.activity.text,
      { type: parsedConfig.activity.type }
    )
  }

  if (onCooldown(config, currentStatusMeta.allow_same)) { return }

  const embed = await generateStatusEmbed(parsedConfig)

  broadcastMessage(embed, discordClient)

  statusWaitList.shift()
  return true
}

function onCooldown(config, isSame) {
  if (!config.status.use_percent) { return false }
  if (!isSame) { return false }
  if (database.getRamDatabase().cooldown === 0) { return false }
  return true
}

async function removeOldStatus(channel, discordClient) {
  if (typeof(channel) === 'undefined') { return }
  
  if (typeof(channel.username) === 'string') { 
    const user = await discordClient.users.fetch(channel.id)
    channel = user.dmChannel
  }

  if (channel === null) { return }

  let lastMessage = await channel.messages.fetch({ limit: 1 })
  lastMessage = lastMessage.first()

  if (lastMessage.author.id !== discordClient.user.id) { return }
  if (lastMessage.deleted) { return }
  if (lastMessage.embeds.size === 0) { return }
  if (typeof(lastMessage.embeds[0]) === 'undefined') { return }
  if (lastMessage.embeds[0].title !== locale.status.printing.title) { return }

  try {
    await lastMessage.delete()
  } catch { }
}

async function broadcastSection(list, section, discordClient, message) {
  for (const index in list) {
    const id = list[index]

    if (section === 'guilds') {
      broadcastSection(list[index].broadcastchannels, 'channels', discordClient, message)
      return
    }

    const channel = await discordClient[section].fetch(id)
    await removeOldStatus(channel, discordClient)
    channel.send(message)
  }
}

function broadcastMessage(message, discordClient) {
  const guildDatabase = database.getDatabase().guilds
  const notifyList = database.getNotifyList()

  if(typeof(message) === 'undefined') { return }

  broadcastSection(guildDatabase, 'guilds', discordClient, message)
  broadcastSection(notifyList, 'users', discordClient, message)
}

function parseConfig(status) {
  const config = metadata[status]
  const localeConfig = locale.status[status]
  const parsedConfig = JSON.stringify(config) 
    .replace(/(\${locale.title})/g, localeConfig.title)
    .replace(/(\${locale.activity})/g, localeConfig.activity)
    .replace(/(\${locale.print_time})/g, locale.status.fields.print_time)
    .replace(/(\${locale.print_layers})/g, locale.status.fields.print_layers)
    .replace(/(\${locale.eta_print_time})/g, locale.status.fields.eta_print_time)
    .replace(/(\${locale.print_progress})/g, locale.status.fields.print_progress)
    .replace(/(\${gcode_file})/g, variables.getCurrentPrintJob())
    .replace(/(\${value_print_time})/g, variables.formatTime(variables.getTimes().duration))
    .replace(/(\${value_eta_print_time})/g, variables.formatTime(variables.getTimes().left))
    .replace(/(\${value_print_progress})/g, variables.getProgress())
    .replace(/(\${value_current_layer})/g, variables.getCurrentLayer())
    .replace(/(\${value_max_layer})/g, variables.getMaxLayers())
  return JSON.parse(parsedConfig)
}

async function generateStatusEmbed(config) {
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

  const buttons = chatUtil.getButtons(config)

  if(typeof(buttons) !== 'undefined') {
    components.push(buttons)
  }
  
  return { embeds: [embed], files, components }
}

module.exports.changeStatus = async (discordClient, newStatus) => {
  return await changeStatus(discordClient, newStatus)
}

module.exports.getManualStatusEmbed = async (channel, discordClient) => {
  await removeOldStatus(channel, discordClient)
  const parsedConfig = parseConfig(currentStatus)
  return await generateStatusEmbed(parsedConfig)
}

module.exports.postBroadcastMessage = async (message, discordClient) => {
  await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })
  broadcastMessage(message, discordClient)
}

module.exports.getStatus = () => { return currentStatus }