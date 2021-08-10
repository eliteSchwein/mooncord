const colors = require('colors')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const WebSocketClient = require('websocket').client
const shell = require('shelljs')
const semver = require('semver')

const client = new WebSocketClient()

let config
let configPath

colors.setTheme({
  database: 'grey',
  error: 'brightRed'
})

execute()

async function migrateNode() {
    const currentVersion = await shell.exec('node -v')
    if (semver.ltr(currentVersion, '16.6.0')) {
        await shell.exec(`bash ${path.resolve(__dirname, '../scripts/migrateNode.sh')}`)
    }
}

async function execute() {
    await migrateNode()

    if (!await hasLegacyConfig()) { return }

    config = require('../config.json')

    console.log(logSymbols.info, 'Connect to Moonraker'.database)

    client.connect(config.moonrakersocketurl)

    client.on('connect', async (connection) => {
        connection.on('message', (message) => {
            migrateConfig(message, connection)
        })
        connection.send('{"jsonrpc": "2.0","method": "server.config","id": 5616}')
    })
}

async function migrateConfig(message, connection) {
    if (message.type !== 'utf8') { return }

    const messageJson = JSON.parse(message.utf8Data)

    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.config) === 'undefined') { return }
    
    configPath = messageJson.result.config.server.config_path
    await migrateConfigToMultiV1()
    runServiceMigration()
    console.log(logSymbols.info, 'Migration Done!'.database)
    connection.close()
}

function hasLegacyConfig() {
    return fs.existsSync(path.resolve(__dirname, '../config.json'))
}

function runServiceMigration() {
    console.log(logSymbols.info, 'Migrate Service File'.database)
    shell.exec(`bash ${path.resolve(__dirname, '../scripts/migrate.sh')} ${configPath}`)
}

async function migrateConfigToMultiV1() {
    console.log(logSymbols.info, 'Migrate 0.0.2 Config to 0.0.3 Config'.database)
    const tempConfig = require(path.resolve(__dirname, '../scripts/mooncord.json'))
    tempConfig.connection = {
        "moonraker_socket_url": config.moonrakersocketurl,
        "moonraker_url": config.moonrakerurl,
        "bot_token": config.bottoken,
        "bot_application_key": config.botapplicationkey,
        "bot_application_id": config.botapplicationid
    }
    tempConfig.status.update_interval = config.statusupdateinterval
    tempConfig.status.use_percent = config.statusupdatepercent
    tempConfig.permission = {
        "controller": [config.masterid],
        "guild_admin_as_bot_admin": true
    }
    tempConfig.webcam.url = config.webcamsnapshoturl
    saveData(tempConfig, `${configPath}/mooncord.json`)
    await fs.unlinkSync(path.resolve(__dirname, '../config.json'))
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
    console.log(logSymbols.info, `The Data for ${datapath} has been migrated!`.database)
}