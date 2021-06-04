const args = process.argv.slice(2)

const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const path = require('path')
const variables = require('../utils/variablesUtil')
const { GatewayServer, SlashCreator } = require('slash-create')

const config = require(`${args[0]}/mooncord.json`)
const events = require('../discord/events')


const discordClient = new Discord.Client()

let connected = false

function enableEvents() {
  console.log('  Enable Discord Events'.statusmessage)

  events(discordClient)
}

function loginBot() {
  console.log('  Connect Discord Bot'.statusmessage)

  discordClient.login(config.connection.bottoken)

  discordClient.on('ready', () => {
    connected = true
    variables.setInviteUrl(`https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`)
    console.log(`  ${'Discordbot Connected'.success}
    ${'Name:'.successname} ${(discordClient.user.tag).successvalue}
    ${'Invite:'.successname} ${variables.getInviteUrl()}`.successvalue)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })
  })
}

function enableCommands() {
  console.log('  Sync Slash Commands'.statusmessage)

  const creator = new SlashCreator({
    applicationID: config.connection.botapplicationid,
    publicKey: config.connection.botapplicationkey,
    token: config.connection.bottoken,
  })

  creator
    .registerCommandsIn(path.join(__dirname, '../discord/commands'))
    .syncCommands()
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => discordClient.ws.on('INTERACTION_CREATE', handler)
      )
    )
}

module.exports = {}
module.exports.init = async () => {
  console.log(`\n
  ${
  ` ___  _                   _
  |   \\(_)___ __ ___ _ _ __| |
  | |) | (_-</ _/ _ \\ '_/ _\` |
  |___/|_/__/\\__\\___/_| \\__,_|`.statustitle}
                              `)
  loginBot()
  await waitUntil(() => connected === true, { timeout: Number.POSITIVE_INFINITY })
  enableCommands()
  enableEvents()
  
}
module.exports.isConnected = function() { return connected }
module.exports.getClient = function () { return discordClient }
