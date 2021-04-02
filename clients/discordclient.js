const Discord = require('discord.js')
const path = require('path')
const { GatewayServer, SlashCreator } = require('slash-create')
const { waitUntil } = require('async-wait-until')
const consoleColor = require("node-console-colors");

const uploadEvent = require('../discord-events/upload')

const config = require('../config.json')

const discordClient = new Discord.Client()

let connected = false

function enableEvents() {
  console.log(consoleColor.set('fg_cyan', '  Enable Discord Events'))

  uploadEvent(discordClient)
}

function loginBot() {
  console.log(consoleColor.set('fg_cyan', '  Connect Discord Bot'))

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    connected = true
    console.log(`  ${consoleColor.set('fg_green', 'Discordbot Connected')}
    ${consoleColor.set('fg_dark_green', 'Name:')} ${consoleColor.set('fg_green', discordClient.user.tag)}
    ${consoleColor.set('fg_dark_green', 'Invite:')} ${consoleColor.set('fg_green', `https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&scope=applications.commands%20bot&permissions=336063568`)}`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })
  })
}

function enableCommands() {
  console.log(consoleColor.set('fg_cyan', '  Sync Slash Commands'))

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
  console.log(`\n${consoleColor.set('fg_gray','-----------------------------------')}
 ${consoleColor.set('fg_dark_cyan', `
  ___  _                   _
 |   \\(_)___ __ ___ _ _ __| |
 | |) | (_-</ _/ _ \\ '_/ _\` |
 |___/|_/__/\\__\\___/_| \\__,_|`)}
                             `)
  loginBot()
  await waitUntil(() => connected === true)
  enableCommands()
  enableEvents()
  console.log(consoleColor.set('fg_gray', '-----------------------------------'))
  
}
module.exports.isConnected = function() { return connected }
module.exports.getClient = function () { return discordClient }
