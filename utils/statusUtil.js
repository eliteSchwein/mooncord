const { waitUntil } = require('async-wait-until')
const { MessageButton } = require('discord-buttons')
const logSymbols = require('log-symbols')

const args = process.argv.slice(2)
 
const config = require(`${args[0]}/mooncord.json`)
const database = require('./databaseUtil')
const locale = require('./localeUtil')
const metadata = require('./status_meta_data.json')
const variables = require('./variablesUtil')
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

  await waitUntil(() => statusWaitList[0] === id, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 2000 })

  await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })

  currentStatus = newStatus

  console.log(logSymbols.info, `Printer Status: ${newStatus}`.printstatus)
  
  const parsedConfig = parseConfig(currentStatus)

  if (typeof (parsedConfig.activity) !== 'undefined') {
    discordClient.user.setActivity(
      parsedConfig.activity.text,
      { type: parsedConfig.activity.type }
    )
  }

  if (onCooldown(config, currentStatusMeta.allow_same)) { return }
  
  const buttons = getButtons(parsedConfig)
  const embed = await chatUtil.generateStatusEmbed(parsedConfig)

  if (buttons.length > 0) {
    broadcastMessage({ embed: embed, buttons: buttons }, discordClient)
  } else {
    broadcastMessage(embed, discordClient)
  }

  statusWaitList.shift()
  return true
}

function getButtons(config) {
  const buttonRow = []
  for (const index in config.buttons) {
    const buttonMeta = config.buttons[index]
    const button = new MessageButton()
      .setStyle(buttonMeta.style)
      .setID(buttonMeta.id)
      .setEmoji(buttonMeta.emoji)
      .setLabel(buttonMeta.label)

    buttonRow.push(button)
  }
  return buttonRow
}

function onCooldown(config, isSame) {
  if (!config.status.use_percent) { return false }
  if (!isSame) { return false }
  if (database.getRamDatabase().cooldown !== 0) { return false }
  return true
}

async function removeOldStatus(channel, discordClient) {

  if (typeof(channel) === 'undefined') { return }
  if (typeof(channel.username) !== 'undefined') { channel = channel.dmChannel }
  if (channel === null) { return }

  let lastMessage = await channel.messages.fetch({ limit: 1 })
  lastMessage = lastMessage.first()

  if (lastMessage.author.id !== discordClient.user.id) { return }
  if (lastMessage.embeds.size < 1) { return }
  if (typeof(lastMessage.embeds[0]) === 'undefined') { return }
  if (lastMessage.embeds[0].title !== locale.status.printing.title) { return }

  await lastMessage.delete()
}

async function broadcastSection(list, section, discordClient, message) {
  for (const index in list) {
    let id = list[index]

    if (section === 'guilds') {
      broadcastSection(list[index].broadcastchannels, 'channels', discordClient, message)
      return
    }

    channel = await discordClient[section].fetch(id)

    if(section === 'channels') { console.log(channel) }
    await removeOldStatus(channel, discordClient)
    console.log(channel)
    channel.send(message).catch('console.error')
  }
}

function broadcastMessage(message, discordClient) {
  const guildDatabase = database.getDatabase().guilds
  const notifyList = database.getNotifyList()

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

module.exports.changeStatus = async (discordClient, newStatus) => {
  return await changeStatus(discordClient, newStatus)
}

module.exports.getManualStatusEmbed = async () => {
  const parsedConfig = parseConfig(currentStatus)
  return await chatUtil.generateStatusEmbed(parsedConfig)
}

module.exports.postBroadcastMessage = async (message, discordClient) => {
  await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })
  broadcastMessage(message, discordClient)
}

module.exports.getStatus = () => { return currentStatus }