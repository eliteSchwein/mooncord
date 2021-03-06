const Discord = require('discord.js')
const logSymbols = require('log-symbols');

const discordClient = require('../clients/discordclient') 
const database = require('./databaseUtil')
const messageconfig = require('./statusconfig.json')
const thumbnail = require('./thumbnailUtil')
const variables = require('./variablesUtil')
const webcam = require('./webcamUtil')

function getDatabase(altdatabase){
  if(typeof(altdatabase) !== 'undefined'){
    return altdatabase
  }
  return database.getDatabase()
}

function getDiscordClient(altdiscordClient){
  if (typeof (altdiscordClient) !== 'undefined') {
    return altdiscordClient
  }
  return discordClient.getClient()
}

function triggerStatusUpdate(altdiscordClient) {
  console.log(logSymbols.info, `Printer Status: ${variables.getStatus()}`.printstatus)
  const statusConfig = messageconfig[variables.getStatus()]

  const client = getDiscordClient(altdiscordClient)

  setTimeout(async () => {
    const parsedConfig = parseConfig(statusConfig)
    const embed = await generateEmbed(parsedConfig)

    if (typeof (parsedConfig.activity) !== 'undefined') {
      client.user.setActivity(
        parsedConfig.activity.text,
        { type: parsedConfig.activity.type }
      )
    }
    postStatus(embed, client)
    notifyStatus(embed, client)
  }, 1000)
}

function parseConfig(config) {
  const parsedConfig = JSON.stringify(config)
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

  if (typeof (user) === 'undefined') {
    embed.setFooter('Automatic')
    embed.setTimestamp()
  }
  
  return embed
}

function postStatus(message, altdiscordClient, altdatabase) {

  const client = getDiscordClient(altdiscordClient)

  const botdatabase = getDatabase(altdatabase)
  
  for (const guildid in botdatabase.guilds) {
    client.guilds.fetch(guildid)
      .then(async (guild) => {
        const guilddatabase = botdatabase.guilds[guild.id]
        for (const index in guilddatabase.broadcastchannels) {
          const channel = await client.channels.fetch(guilddatabase.broadcastchannels[index])
          channel.send(message)
        }
      })
      .catch((error) => { console.log((error).error) })
  }
}

function notifyStatus(message, altdiscordClient, altdatabase) {
  const client = getDiscordClient(altdiscordClient)

  const botdatabase = getDatabase(altdatabase)

  const notifylist = botdatabase.notify

  for (const notifyindex in notifylist) {
    const clientid = notifylist[notifyindex]
    client.users.fetch(clientid)
      .then((user) => {
        user.send(message).catch('console.error')
      })
      .catch((error) => { console.log((error).error) })
  }
}

module.exports.triggerStatusUpdate = async function (altdiscordClient) {
  await triggerStatusUpdate(altdiscordClient)
}

module.exports.getManualStatusEmbed = async function (user) {
  const statusConfig = messageconfig[variables.getStatus()]
  const parsedConfig = parseConfig(statusConfig)
  return await generateEmbed(parsedConfig, user)
}

module.exports.postBroadcastMessage = (message, altdiscordClient, altdatabase) => {
  postStatus(message, altdiscordClient, altdatabase)
  notifyStatus(message, altdiscordClient, altdatabase)
}
