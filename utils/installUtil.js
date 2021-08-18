const colors = require('colors')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const WebSocketClient = require('websocket').client
const shell = require('shelljs')

const client = new WebSocketClient()

let config
let configPath

colors.setTheme({
  database: 'grey',
  error: 'brightRed'
})

execute()

async function execute() {
    config = require('../mooncord.json')

    client.connect(config.moonrakersocketurl)

    client.on('connect', async (connection) => {
        connection.on('message', (message) => {
            getPath(message, connection)
        })
        connection.send('{"jsonrpc": "2.0","method": "server.config","id": 5616}')
    })
}

async function getPath(message, connection) {
    if (message.type !== 'utf8') { return }

    const messageJson = JSON.parse(message.utf8Data)

    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.config) === 'undefined') { return }

    configPath = messageJson.result.config.server.config_path

    console.log(configPath)

    connection.close()
}