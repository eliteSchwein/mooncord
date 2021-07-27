const args = process.argv.slice(2)

const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const si = require('systeminformation')

const discordClient = require('../clients/discordClient')
const chatUtil = require('./chatUtil')
const database = require('./databaseUtil')
const componentHandler = require('./hsComponents')
const locale = require('./localeUtil')
const status = require('./statusUtil')

const config = require(`${args[0]}/mooncord.json`)

const usageData = {
  'cpu': {
    'load': 0,
    'temp': 0
  }
}

let throttleCoolDown = 0

module.exports.getUsageData = () => { return usageData }

module.exports.getDefaultEmbed = (img, title) => {
  const image = getImage(img)
  const embed = getDefaultEmbed(image[0], title)
  return [image, embed]
}

module.exports.getInformation = async function (component) {
  const img = getImage(component)
  const componentData = componentHandler[component]
  const fields = await componentData.getFields()
  const embed = getDefaultEmbed(img[0], componentData.getTitle())
  if (fields.length > 0) {
    for (const fieldindex in fields) {
      const field = fields[fieldindex]
      embed.addField(field.name, field.value, field.inline)
    }
  } else {
    const description = locale.errors.no_data
      .replace(/(\${component})/g, `\`${componentData.getTitle()}\``)
    
    embed.setColor('#c90000')
    embed.setDescription(description)
  }
  return [img, embed]
}

module.exports.init = () => {
  setInterval(async () => {
    const ram = await si.mem()
    const partitions = await si.fsSize()

    let throttled = false

    usageData.cpu.load = await si.currentLoad()
    usageData.cpu.temp = await si.cpuTemperature()
    
    if (!config.system_notifications.system_warns) { return }

    if (throttleCoolDown > 0) { return }
    
    if (isCPUOverloaded()) { throttled = true }
    if (isCPUOverheating()) { throttled = true }
    if (isRAMFull(ram)) { throttled = true }
    if (isPartitionsFull(partitions)) { throttled = true }
    
    if (throttled) {
      throttleCoolDown = 60
    }
  }, 1000)
}

function isCPUOverloaded() {
  if (usageData.cpu.load.currentLoad > 95) {
    postThrottle('high_cpu_load')
    return true
  }
  return false
}

function isCPUOverheating() {
  if (usageData.cpu.temp.main > 80) {
    postThrottle('high_cpu_temp')
    return true
  }
  return false
}
function isRAMFull(ram) {
  if (ram.free < Number.parseInt('100_000_000')) {
    postThrottle('high_ram_usage')
    return true
  }
  return false
}
function isPartitionsFull(partitions) {
  let anyFull = false
  for (const index in partitions) {
    const partition = partitions[index]
    if (partition.aviable < Number.parseInt('100_000_000')) {
      postThrottle('high_partition_usage', partition.mount)
      anyFull = true
    }
  }
  return anyFull
}

function getImage(component) {
        
  const imgPath = path.resolve(__dirname, `../images/${component}.png`)
  const imgBuffer = fs.readFileSync(imgPath)

  return [`${component}.png`, imgBuffer]
}

async function postThrottle(component, section) {
  if(typeof(section) === 'undefined') { section = '' }

  await waitUntil(() => discordClient.getClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1000 })
  
  const sentence = locale.loadthrottle.sentence
    .replace(/(\${reason})/g, `\`${locale.loadthrottle[component].name}\``)
  const suggestion = locale.loadthrottle[component].suggestion
    .replace(/(\${component_section})/g, `\`${section}\``)
  
  console.log(logSymbols.warning, `A System Warn occured: ${component}!`.throttlewarn)
  
  const throttleEmbed = chatUtil.generateWarnEmbed(
    locale.loadthrottle.title,
    `${sentence}
  ${suggestion}`)
  
  status.postBroadcastMessage(throttleEmbed, discordClient.getClient, database)
}

function getDefaultEmbed(img, title) {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setThumbnail(`attachment://${img}`)
}
