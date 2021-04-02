const fs = require('fs')
const path = require('path')
const WebSocketClient = require('websocket').client
const { waitUntil } = require('async-wait-until')
const consoleColor = require("node-console-colors");

const variables = require('../utils/variablesUtil')
const discordClient = require('./discordclient')
const config = require('../config.json')

const events = require('../websocket-events')

const client = new WebSocketClient()

let connected = false

let WSconnection

const enableEvents = async function () {
  console.log('  Enable Moonraker Events')

  client.on('connect', async (connection) => {
    const id = Math.floor(Math.random() * 10000) + 1
    console.log(consoleColor.set('fg_green', '  Moonraker Client Connected'))

    connected = true

    WSconnection = connection

    console.log(consoleColor.set('fg_cyan', '  Sent initial Moonraker commands'))

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)

    console.log(consoleColor.set('fg_cyan', '  Initial Automatic Moonraker commands'))
    
    setTimeout(() => {
      setInterval(() => {
        connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
        connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)
        connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ${id}}`)
      }, 250)
    }, 250)

    fs.readdir(path.resolve(__dirname, '../websocket-events'), (err, files) => {
      if (err) {
        console.log(err)
        return
      }
      connection.on('close', () => {
        console.log(consoleColor.set('fg_red', '  WebSocket Connection Closed'))
        console.log(consoleColor.set('fg_dark_red', '  Reconnect in 5 sec'))
        connected = false
        variables.setStatus('offline')
        statusUtil.triggerStatusUpdate(discordClient.getClient())
        setTimeout(() => {
          client.connect(config.moonrakersocketurl)
        }, 5000)
      })
      connection.on('message', (message) => {
        files.forEach(file => {
          if (file !== 'index.js') {
            const event = events[file.replace('.js', '')]
            event(message, connection)
          }
        })
      })
    })
  })
}

function connect() {
  console.log(consoleColor.set('fg_cyan', '  Connect to Moonraker'))
  
  client.connect(config.moonrakersocketurl)

  client.on('connectFailed', (error) => {
    console.log(consoleColor.set('fg_red', `  Connect Error: ${error.toString()}`))
    variables.setStatus('offline')
    console.log(consoleColor.set('fg_red', '  Please check your Config!'))
    connected = false
    setTimeout(() => {
      process.exit(5)
    }, 2000)
  })
}

module.exports = {}
module.exports.init = async () => {
  console.log(`\n
  ${consoleColor.set('fg_dark_cyan',
  `__  __                        _           
  |  \\/  |___  ___ _ _  _ _ __ _| |_____ _ _ 
  | |\\/| / _ \\/ _ \\ ' \\| '_/ _\` | / / -_) '_|
  |_|  |_\\___/\\___/_||_|_| \\__,_|_\\_\\___|_|`)}
                              `)
  connect()
  await waitUntil(() => connected === true)
  enableEvents()
}
module.exports.getConnection = () => { return WSconnection }
