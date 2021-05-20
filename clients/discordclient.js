const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const path = require('path')
const { GatewayServer, SlashCreator } = require('slash-create')

const config = require('../config.json')
const events = require('../discord/events')


const discordClient = new Discord.Client()

let connected = false

function enableEvents() {
  console.log('  Enable Discord Events'.statusmessage)

  events(discordClient)
}

function loginBot() {
  console.log('  Connect Discord Bot'.statusmessage)

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    connected = true
    console.log(`  ${'Discordbot Connected'.success}
    ${'Name:'.successname} ${(discordClient.user.tag).successvalue}
    ${'Invite:'.successname} ${`https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`.successvalue}`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })
  })
}

function enableCommands() {
  console.log('  Sync Slash Commands'.statusmessage)

  const creator = new SlashCreator({
    applicationID: config.botapplicationid,
    publicKey: config.botapplicationkey,
    token: config.bottoken,
  });

  creator
    .registerCommandsIn(path.join(__dirname, '../discord/commands'))
    .syncCommands();
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => discordClient.ws.on('INTERACTION_CREATE', handler)
      )
    );
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
