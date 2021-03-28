'use strict'
const systemInfo = require('systeminformation')
const path = require('path')
const fs = require('fs')

const discordevents = require('./discord-events')
const statusUtil = require('./utils/statusUtil')
const variables = require('./utils/variablesUtil')
const websocketevents = require('./websocketevents')
const discordDatabase = require('./discorddatabase')

const WebSocketClient = require('websocket').client

const pjson = require('./package.json')
const config = require('./config.json')

const { GatewayServer, SlashCreator } = require('slash-create');
const Discord = require('discord.js')

const discordClient = new Discord.Client()

const updatecheck = './temp/0.0.2check'

let reconnect = false

systemInfo.osInfo().then(async data => {
  console.log(`${'\n' +
    '    __  __                    ____              _ \n' +
    '   |  \\/  | ___   ___  _ __  / ___|___  _ __ __| |\n' +
    "   | |\\/| |/ _ \\ / _ \\| '_ \\| |   / _ \\| '__/ _` |\n" +
    '   | |  | | (_) | (_) | | | | |__| (_) | | | (_| |\n' +
    '   |_|  |_|\\___/ \\___/|_| |_|\\____\\___/|_|  \\__,_|\n' +
    '                                                  \n' +
    'Version: '}${pjson.version}\n` +
    `Author: ${pjson.author}\n` +
    `Homepage: ${pjson.homepage}\n` +
    `OS: ${data.platform}\n` +
    `Distro: ${data.distro}\n` +
    `Kernel: ${data.kernel}\n` +
    `Arch: ${data.arch}`)
  const websocketClient = new WebSocketClient()
  const ram = await systemInfo.mem()

  if (ram.free <= 20971520) {
    console.log(
      `${'     _  _____ _____ _____ _   _ _____ ___ ___  _   _ \n' +
      '    / \\|_   _|_   _| ____| \\ | |_   _|_ _/ _ \\| \\ | |\n' +
      '   / _ \\ | |   | | |  _| |  \\| | | |  | | | | |  \\| |\n' +
      '  / ___ \\| |   | | | |___| |\\  | | |  | | |_| | |\\  |\n' +
      ' /_/   \\_\\_|   |_| |_____|_| \\_| |_| |___\\___/|_| \\_|\n' +
      '                                                  \n' +
      'There might be to few free memory! Mooncord need atleast 20MB RAM\n' +
      'Current free Ram: '}${(ram.used / (1024 ** 2)).toFixed(2)}MB`)
    process.exit(5)
  }

  console.log('\nConnect Discord Bot...\n')

  const creator = new SlashCreator({
    applicationID: config.botapplicationid,
    publicKey: config.botapplicationkey,
    token: config.bottoken,
  });

  creator
    .registerCommandsIn(path.join(__dirname, 'slash-commands'))
    .syncCommands();
  
  creator
    .withServer(
      new GatewayServer(
        (handler) => discordClient.ws.on('INTERACTION_CREATE', handler)
      )
    );

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    console.log('Discordbot Connected\n')
    console.log(`Name: ${discordClient.user.tag}`)
    console.log(`Invite: https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&scope=applications.commands%20bot&permissions=336063568\n`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })

    console.log('Connect Websocket...\n')

    websocketClient.on('connectFailed', (error) => {
      console.log(`Connect Error: ${error.toString()}`)
      console.log('Reconnect in 5 sec')
      variables.setStatus('offline')
      setTimeout(() => {
        websocketClient.connect(config.moonrakersocketurl)
      }, 5000)
    })

    console.log('Enable Websocket Events...\n')

    websocketevents(websocketClient, discordClient)

    websocketClient.on('connect', (connection) => {
      console.log('WebSocket Client Connected\n')
      if (!reconnect) {
        console.log('Enable Discord Events...\n')

        discordevents(discordClient, connection)

        try {
          if (!fs.existsSync(updatecheck)) {
            const database = discordDatabase.getDatabase()
            for (const guildid in database) {
              discordClient.guilds.fetch(guildid)
                .then(async (guild) => {
                  const guilddatabase = database[guild.id]
                  const broadcastchannels = guilddatabase.statuschannels
                  for (const index in broadcastchannels) {
                    const channel = guild.channels.cache.get(broadcastchannels[index])
                    channel.send(`<@${config.masterid}> Please reinvite this Bot! \nYou have to do that to enable the Slash Commands!\nURL:https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&scope=applications.commands%20bot&permissions=336063568\n`)
                  }
                })
                .catch((error) => { console.log(error) })
            }
            fs.writeFile(updatecheck, 'Updated!', function (err) {
              if (err) throw err;
              console.log('Version Lock File generated!.');
            });
          }
        } catch(err) {
          console.error(err)
        }
      }
      connection.on('close', () => {
        console.log('WebSocket Connection Closed')
        console.log('Reconnect in 5 sec')
        variables.setStatus('offline')
        statusUtil.triggerStatusUpdate(discordClient)
        reconnect = true
        setTimeout(() => {
          websocketClient.connect(config.moonrakersocketurl)
        }, 5000)
      })
    })

    websocketClient.connect(config.moonrakersocketurl)
  })
})
