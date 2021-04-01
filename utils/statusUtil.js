const Discord = require('discord.js')

const database = require('./databaseUtil')
const variables = require('./variablesUtil')
const thumbnail = require('./thumbnailUtil')
const webcam = require('./webcamUtil')

const discordClient = require('../clients/discordclient') 
const messageconfig = require('./statusconfig.json')

async function triggerStatusUpdate () {
  console.log(`Printer Status: ${variables.getStatus()}`)
  const statusConfig = messageconfig[variables.getStatus()]
  setTimeout(async () => {
    const parsedConfig = parseConfig(statusConfig)
    const embed = await generateEmbed(parsedConfig)
    postStatus(embed)
  }, 1000)
}

function parseConfig(config) {
  let parsedConfig = JSON.stringify(config)
    .replace(/(\${currentFile})/g, variables.getCurrentFile())
    .replace(/(\${formatedPrintTime})/g, variables.getFormatedPrintTime())
    .replace(/(\${formatedETAPrintTime})/g, variables.getFormatedRemainingTime())
    .replace(/(\${printProgress})/g, variables.getProgress())

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
    for (let index in config.fields) {
      embed.addField(config.fields[index].name, config.fields[index].value, true)
    }
  }
  if (config.versions) {
    const currentVersions = variables.getVersions()
    for (let component in currentVersions) {
      if (component !== 'system') {
        let componentdata = currentVersions.component
        let version = componentdata.version
        if (version !== componentdata.remote_version) {
          version = version.concat(` **(${componentdata.remote_version})**`)
        }
        embed.addField(component, version, true)
      }
    }
  }

  if (typeof (user) === 'undefined') {
    embed.setFooter('Automatic')
    embed.setTimestamp()
  }
  
  return embed
}

function postStatus(message) {
  const botdatabase = database.getDatabase()
  for (const guildid in botdatabase.guilds) {
    discordClient.getClient().guilds.fetch(guildid)
      .then(async (guild) => {
        const guilddatabase = botdatabase.guilds[guild.id]
        for (const index in guilddatabase.broadcastchannels) {
          const channel = guild.channels.cache.get(guilddatabase.broadcastchannels[index])
          channel.send(message)
        }
      })
      .catch((error) => { console.log(error) })
  }
}

module.exports.triggerStatusUpdate = async function () {
  await triggerStatusUpdate()
}

module.exports.getManualStatusEmbed = async function (user) {
  const statusConfig = messageconfig[variables.getStatus()]
  const parsedConfig = parseConfig(statusConfig)
  return await generateEmbed(parsedConfig, user)
}
