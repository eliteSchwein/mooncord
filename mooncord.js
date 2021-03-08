'use strict'
const systemInfo = require('systeminformation')

const discordevents = require('./discord-events')
const variables = require('./utils/variablesUtil')
const websocketevents = require('./websocketevents')

const WebSocketClient = require('websocket').client

const pjson = require('./package.json')
const config = require('./config.json')

const Discord = require('discord.js')

const discordClient = new Discord.Client()
let reconnect = false

systemInfo.osInfo().then(data => {
  console.log(`${'\n' +
    '    __  __                    ____              _ \n' +
    '   |  \\/  | ___   ___  _ __  / ___|___  _ __ __| |\n' +
    "   | |\\/| |/ _ \\ / _ \\| '_ \\| |   / _ \\| '__/ _` |\n" +
    '   | |  | | (_) | (_) | | | | |__| (_) | | | (_| |\n' +
    '   |_|  |_|\\___/ \\___/|_| |_|\\____\\___/|_|  \\__,_|\n' +
    '                                                  \n' +
    'Version: '}${  pjson.version  }\n` +
    `Author: ${  pjson.author  }\n` +
    `Homepage: ${  pjson.homepage  }\n` +
    `OS: ${  data.platform  }\n` +
    `Distro: ${  data.distro  }\n` +
    `Kernel: ${  data.kernel  }\n` +
    `Arch: ${  data.arch}`)
  const websocketClient = new WebSocketClient()

  console.log('\nConnect Discord Bot...\n')

  discordClient.login(config.bottoken)

  discordClient.on('ready', () => {
    console.log('Discordbot Connected\n')
    console.log(`Name: ${  discordClient.user.tag}`)
    console.log(`Invite: https://discord.com/oauth2/authorize?client_id=${  discordClient.user.id  }&scope=bot&permissions=336063568\n`)
    discordClient.user.setActivity('Printer start', { type: 'WATCHING' })

    console.log('Connect Websocket...\n')

    websocketClient.on('connectFailed', (error) => {
      console.log(`Connect Error: ${  error.toString()}`)
      console.log('Reconnect in 5 sec')
      variables.setStatus('offline')
      setTimeout(() => {
        websocketClient.connect(config.moonrakersocketurl)
      }, 5000)
    })

    console.log('Enable Websocket Events...\n')

    websocketClient.setMaxListeners(20)

    websocketevents(websocketClient, discordClient)

    websocketClient.on('connect', (connection) => {
      console.log('WebSocket Client Connected\n')
      if (!reconnect) {
        console.log('Enable Discord Events...\n')

        discordevents(discordClient, connection)
      }
      connection.on('close', () => {
        console.log('WebSocket Connection Closed')
        console.log('Reconnect in 5 sec')
        variables.setStatus('offline')
        variables.triggerStatusUpdate(discordClient)
        reconnect = true
        setTimeout(() => {
          websocketClient.connect(config.moonrakersocketurl)
        }, 5000)
      })
    })

    websocketClient.connect(config.moonrakersocketurl)
  })
})
