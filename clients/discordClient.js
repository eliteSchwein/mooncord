const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const path = require('path')

const events = require('../discord/events')
const commands = require('../discord/commands')
const variables = require('../utils/variablesUtil')

const discordClient = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS
  ]
})

let connected = false
let token
let applicationID
let applicationKey

function enableEvents() {
  console.log('  Enable Discord Events'.statusmessage)

  events(discordClient)
  commands.addCommandEvents(discordClient)
}

function loginBot() {
  console.log('  Connect Discord Bot'.statusmessage)

  discordClient.login(token)

  discordClient.on('ready', () => {
    connected = true
    variables.setInviteUrl(`https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`)
    console.log(`  ${'Discordbot Connected'.success}
    ${'Name:'.successname} ${(discordClient.user.tag).successvalue}
    ${'Invite:'.successname} ${variables.getInviteUrl()}`.successvalue)
  })
}

function enableCommands(useconsole) {
  if (useconsole) {
    console.log('  Sync Slash Commands'.statusmessage)
  }
  commands.loadSlashCommands(discordClient)
}

module.exports = {}
module.exports.init = async (discordToken, discordApplicationID, discordApplicationKey) => {
  token = discordToken
  applicationID = discordApplicationID
  applicationKey = discordApplicationKey

  await waitUntil(() => variables.dump !== variables.dumpRaw, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })
  await waitUntil(() => Object.keys(variables.getMCUList()).length > 0, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1500 })
  
  console.log(`\n
  ${
  ` ___  _                   _
  |   \\(_)___ __ ___ _ _ __| |
  | |) | (_-</ _/ _ \\ '_/ _\` |
  |___/|_/__/\\__\\___/_| \\__,_|`.statustitle}
                              `)
  loginBot()
  await waitUntil(() => connected === true, { timeout: Number.POSITIVE_INFINITY })
  enableCommands( true )
  enableEvents()
}
module.exports.isConnected = connected 
module.exports.getClient = discordClient
