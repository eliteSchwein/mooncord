const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const path = require('path')
const buttons = require('discord-buttons')
const { GatewayServer, SlashCreator } = require('slash-create')

const events = require('../discord/events')
const variables = require('../utils/variablesUtil')


const discordClient = new Discord.Client()

let creator
let connected = false
let token
let applicationID
let applicationKey

function enableEvents() {
  console.log('  Enable Discord Events'.statusmessage)

  events(discordClient)
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

  creator
    .registerCommandsIn(path.join(__dirname, '../discord/commands'))
    .registerCommandsIn(path.join(__dirname, '../discord/dynamicCommands'))
    .syncCommands()
}
function enableCreator() {
  console.log('  Enable Slash Command Creator'.statusmessage)

  creator = new SlashCreator({
    applicationID,
    publicKey: applicationKey,
    token,
  })
}

function enableServer() {
  console.log('  Enable Slash Command Server'.statusmessage)
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => discordClient.ws.on('INTERACTION_CREATE', handler)
      )
    )
}

function enableButtons() {
  console.log('  Enable Message Buttons'.statusmessage)
  buttons(discordClient)
}

module.exports = {}
module.exports.init = async (discordToken, discordApplicationID, discordApplicationKey) => {
  token = discordToken
  applicationID = discordApplicationID
  applicationKey = discordApplicationKey
  console.log(`\n
  ${
  ` ___  _                   _
  |   \\(_)___ __ ___ _ _ __| |
  | |) | (_-</ _/ _ \\ '_/ _\` |
  |___/|_/__/\\__\\___/_| \\__,_|`.statustitle}
                              `)
  loginBot()
  await waitUntil(() => connected === true, { timeout: Number.POSITIVE_INFINITY })
  enableCreator()
  enableCommands( true )
  enableServer()
  enableEvents()
  enableButtons()
}
module.exports.isConnected = function() { return connected }
module.exports.getClient = function () { return discordClient }
