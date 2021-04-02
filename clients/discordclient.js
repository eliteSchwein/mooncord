const Discord = require('discord.js')
const path = require('path')
const { GatewayServer, SlashCreator } = require('slash-create')
const { waitUntil } = require('async-wait-until')

const uploadEvent = require('../discord-events/upload')

const config = require('../config.json')

const discordClient = new Discord.Client()

let connected = false

function enableEvents() {
  console.log('  Enable Discord Events...')

  uploadEvent(discordClient)
}

function loginBot() {
  console.log('  Connect Discord Bot...')

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    connected = true
    console.log(`  Discordbot Connected
    Name: ${discordClient.user.tag}
    Invite: https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&scope=applications.commands%20bot&permissions=336063568`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })
  })
}

function enableCommands() {
  console.log('  Sync Slash Commands')

  const creator = new SlashCreator({
    applicationID: config.botapplicationid,
    publicKey: config.botapplicationkey,
    token: config.bottoken,
  });

  creator
    .registerCommandsIn(path.join(__dirname, '../discord-commands'))
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
  console.log(`\n-----------------------------------
  ___  _                   _ 
 |   \\(_)___ __ ___ _ _ __| |
 | |) | (_-</ _/ _ \\ '_/ _\` |
 |___/|_/__/\\__\\___/_| \\__,_|
                             `)
  enableCommands()
  loginBot()
  enableEvents()
  await waitUntil(() => connected === true)
  console.log('-----------------------------------')
  
}
module.exports.isConnected = function() { return connected }
module.exports.getClient = function () { return discordClient }
