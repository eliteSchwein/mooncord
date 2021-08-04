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

    console.log(logSymbols.info, 'Connect to Moonraker'.database)

    client.connect(config.moonrakersocketurl)

    client.on('connect', async (connection) => {
        connection.on('message', (message) => {
            moveConfig(message, connection)
        })
        connection.send('{"jsonrpc": "2.0","method": "server.config","id": 5616}')
    })
}

async function moveConfig(message, connection) {
    if (message.type !== 'utf8') { return }

    const messageJson = JSON.parse(message.utf8Data)

    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.config) === 'undefined') { return }

    configPath = messageJson.result.config.server.config_path

    connection.close()

    saveData(config, `${configPath}/mooncord.json`)
    await fs.unlinkSync(path.resolve(__dirname, '../mooncord.json'))
}

function saveData(datadata, datapath) {
    if (!fs.existsSync(path.resolve(__dirname, datapath))) {
        const newFileStream = fs.createWriteStream(path.resolve(__dirname, datapath))
        newFileStream.once('open', () => {
            newFileStream.write('{}')
            newFileStream.end()
        })
    }
    fs.writeFileSync(path.resolve(__dirname, datapath), JSON.stringify(datadata, null, 4))
    console.log(logSymbols.info, `The Config got saved under ${datapath}!`.database)
}