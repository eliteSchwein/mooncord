const colors = require('colors')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')

const moonrakerClient = require('../clients/moonrakerClient')

//const newConfig = require(`${args[1]}/mooncord.json`)

let client
let config

colors.setTheme({
  database: 'grey',
  error: 'brightRed'
})

execute()

async function execute() {
    if (!await hasLegacyConfig()) { return }

    config = require('config.json')
    
    moonrakerClient.init(undefined, config.moonrakersocketurl, false)

    client = moonrakerClient.getClient()
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
    console.log(messageJson)
    //await migrateConfigToMultiV1()
    //connection.close()
}

async function hasLegacyConfig() {
    return await fs.existsSync('config.json')
}

async function migrateConfigToMultiV1() {
    console.log(logSymbols.info, 'Migrate 0.0.2 Config to 0.0.3 Config'.database)
    await fs.writeFileSync('mooncord.json', '{}')
    const tempConfig = require('mooncord.json')
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
    saveData(tempConfig, `${args[1]}/mooncord.json`)
    await fs.unlinkSync('config.json')
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