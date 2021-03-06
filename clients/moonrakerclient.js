const fs = require('fs')
const path = require('path')
const WebSocketClient = require('websocket').client
const { waitUntil } = require('async-wait-until')

const config = require('../config.json')
const database = require('../utils/databaseUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')
const events = require('../websocket-events')

const client = new WebSocketClient()

let connected = false

let WSconnection

const enableEvents = function (discordClient) {
  console.log('  Enable Moonraker Events'.statusmessage)

  client.on('connect', (connection) => {
    const id = Math.floor(Math.random() * parseInt('10_000')) + 1
    console.log('  Moonraker Client Connected'.success)

    connected = true

    WSconnection = connection
    
    setTimeout(() => {
      console.log('  Sent initial Moonraker commands'.statusmessage)

      connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)

      console.log('  Initial Automatic Moonraker commands'.statusmessage)

      setInterval(() => {
        connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
        connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ${id}}`)
      }, 250)
    }, 250)

    connection.on('close', () => {
      console.log('  WebSocket Connection Closed'.error)
      console.log('  Reconnect in 5 sec'.error)
      connected = false
      variables.setStatus('offline')
      status.triggerStatusUpdate(discordClient)
      setTimeout(() => {
        client.connect(config.moonrakersocketurl)
      }, 5000)
    })
    connection.on('message', (message) => {
      for (const event in events) {
        events[event](message, connection, discordClient, database.getDatabase())
      }
    })
  })
}

function connect() {
  console.log('  Connect to Moonraker'.statusmessage)
  
  client.connect(config.moonrakersocketurl)

  client.on('connectFailed', (error) => {
    console.log(`  Connect Error: ${error.toString()}`.error)
    variables.setStatus('offline')
    console.log('  Please check your Config!'.error)
    connected = false
    setTimeout(() => {
      process.exit(5)
    }, 2000)
  })
}

module.exports = {}
module.exports.init = async (discordClient) => {
  console.log(`\n
  ${
  ` __  __                        _           
  |  \\/  |___  ___ _ _  _ _ __ _| |_____ _ _ 
  | |\\/| / _ \\/ _ \\ ' \\| '_/ _\` | / / -_) '_|
  |_|  |_\\___/\\___/_||_|_| \\__,_|_\\_\\___|_|`.statustitle}
                              `)
  connect()
  enableEvents(discordClient)
  await waitUntil(() => connected === true, { timeout: Number.POSITIVE_INFINITY })
}
module.exports.getConnection = () => { return WSconnection }
