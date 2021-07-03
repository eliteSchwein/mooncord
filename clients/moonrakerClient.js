const args = process.argv.slice(2)

const fs = require('fs')
const path = require('path')
const WebSocketClient = require('websocket').client
const { waitUntil } = require('async-wait-until')
const logSymbols = require('log-symbols')

const config = require(`${args[0]}/mooncord.json`)
const database = require('../utils/databaseUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')
const events = require('../websocket-events')

const client = new WebSocketClient()

let WSconnection

function enableEvents(discordClient) {
  console.log('  Enable Moonraker Events'.statusmessage)

  client.on('connect', async (connection) => {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    console.log('  Moonraker Client Connected'.success)

    WSconnection = connection

    console.log('  Sent initial Moonraker commands'.statusmessage)

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"configfile": null }}, "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)

    console.log('  Initial Automatic Moonraker commands'.statusmessage)

    setInterval(() => {
      const mculist = getMCUList()
      connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params": {"refresh": "false"}, "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "machine.proc_stats", "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null, "gcode_move": null, "system_stats": null }}, "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": ${JSON.stringify(mculist)}}, "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)
    }, 500)

    connection.on('close', () => {
      console.log('  WebSocket Connection Closed'.error)
      console.log('  Reconnect in 5 sec'.error)
      variables.setStatus('offline')
      status.triggerStatusUpdate(discordClient.getClient())
      setTimeout(() => {
        client.connect(config.connection.moonraker_socket_url)
      }, 5000)
    })
    connection.on('message', (message) => {
      for (const event in events) {
        events[event](message, connection, discordClient.getClient(), database)
      }
    })
  })
}


function getMCUList() {
  const rawmculist = variables.getMCUList()
  const mculist = {}
  Object.keys(rawmculist).forEach(key => {
    mculist[key] = null
  })
  return mculist
}

function connect() {
  console.log('  Connect to Moonraker'.statusmessage)
  
  client.connect(config.connection.moonraker_socket_url)

  client.on('connectFailed', (error) => {
    console.log(logSymbols.error, `Moonrakerclient: ${error}`.error)
    variables.setStatus('offline')
    console.log('  Please check your Config!'.error)
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
  await waitUntil(() => typeof(WSconnection) !== 'undefined', { timeout: Number.POSITIVE_INFINITY })
  await waitUntil(() => WSconnection.connected === true, { timeout: Number.POSITIVE_INFINITY })
}
module.exports.getConnection = () => { return WSconnection }
