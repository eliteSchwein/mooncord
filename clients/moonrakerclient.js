const fs = require('fs')
const path = require('path')
const WebSocketClient = require('websocket').client

const variables = require('../utils/variablesUtil')
const discordClient = require('./discordclient')
const config = require('../config.json')

const events = require('../websocket-events')

const client = new WebSocketClient()

let WSconnection

const enableEvents = async function () {
  console.log('Enable Websocket Events')

  client.on('connect', async (connection) => {
    const id = Math.floor(Math.random() * 10000) + 1
    console.log('WebSocket Client Connected\n')

    WSconnection = connection

    console.log('Sent initial Moonraker commands')

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ${id}}`)

    console.log('Initial Automatic Moonraker commands')
    
    setInterval(async () => {
      connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)
      connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ${id}}`)
    }, 250)

    fs.readdir(path.resolve(__dirname, '../websocket-events'), (err, files) => {
      if (err) {
        console.log(err)
        return
      }
      connection.on('close', () => {
        console.log('WebSocket Connection Closed')
        console.log('Reconnect in 5 sec')
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
  console.log('Connect to Moonraker')
  
  client.connect(config.moonrakersocketurl)

  client.on('connectFailed', (error) => {
    console.log(`Connect Error: ${error.toString()}`)
    console.log('Reconnect in 5 sec')
    variables.setStatus('offline')
    setTimeout(() => {
      client.connect(config.moonrakersocketurl)
    }, 5000)
  })
}

module.exports = {}
module.exports.init = () => {
  connect()
  enableEvents()
}
module.exports.getConnection = () => { return WSconnection }
