const events = require('../discord-events')

const Discord = require('discord.js')
const path = require('path')
const { GatewayServer, SlashCreator } = require('slash-create')

const config = require('../config.json')

const discordClient = new Discord.Client()

function enableEvents() {
  console.log('Enable Discord Events...\n')

  events()
}

function loginBot() {
  console.log('\nConnect Discord Bot...\n')

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    console.log('Discordbot Connected\n')
    console.log(`Name: ${discordClient.user.tag}`)
    console.log(`Invite: https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&scope=applications.commands%20bot&permissions=336063568\n`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })
  })
}

function enableCommands() {
  console.log('Sync Slash Commands')

  const creator = new SlashCreator({
    applicationID: config.botapplicationid,
    publicKey: config.botapplicationkey,
    token: config.bottoken,
  });

  creator
    .registerCommandsIn(path.join(__dirname, '../slash-commands'))
    .syncCommands();
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => discordClient.ws.on('INTERACTION_CREATE', handler)
      )
    );
}

exports = {}
exports.init = function () {
  enableCommands()
  loginBot()
  enableEvents()
}
exports.getClient = function () { return discordClient }
