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
    console.log(await hasLegacyConfig())
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
    const tempConfig = {}
    tempConfig.connection = {
        "moonraker_socket_url": config.moonrakersocketurl,
        "moonraker_url": config.moonrakerurl,
        "bot_token": config.bottoken,
        "bot_application_key": config.botapplicationkey,
        "bot_application_id": config.botapplicationid
    }
    tempConfig.status = {
        "update_interval": config.statusupdateinterval,
        "use_percent": config.statusupdatepercent,
        "min_interval": 15,
        "before": {
            "enable": false,
            "delay": 0,
            "execute": []
        },
        "after": {
            "enable": false,
            "delay": 0,
            "execute": []
        }
    }
    tempConfig.permission = {
        "controller": [config.masterid],
        "guild_admin_as_bot_admin": true
    }
    tempConfig.webcam = {
        "url": config.webcamsnapshoturl,
        "quality": 80,
        "rotation": 0,
        "brightness": 0,
        "contrast": 0,
        "vertical_mirror": false,
        "horizontal_mirror": false,
        "greyscale": false,
        "sepia": false
    }
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
    fs.writeFile(path.resolve(__dirname, datapath), JSON.stringify(datadata, null, 4), (err) => {
    if (err) { throw err }
        console.log(logSymbols.info, `The Data for ${datapath} has been migrated!`.database)
        if (datapath === '../config.json') {
            console.log(logSymbols.warning, `Please Read the Update Notes, you need to reconfigure the Bot!`.database)
            process.exit(5)
        }
    })
}