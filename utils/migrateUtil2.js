const args = process.argv.slice(2)

const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const colors = require('colors')

const config = require(`${args[0]}/config.json`)

const newConfig = require(`${args[1]}/mooncord.json`)


colors.setTheme({
  database: 'grey',
  error: 'brightRed'
})

execute()

async function execute() {
    //await migrateDatabase()
    migrateConfigToMultiV1()
}

function migrateConfigToMultiV1() {
    console.log(logSymbols.info, 'Migrate 0.0.2 Config to 0.0.3 Config'.database)
    newConfig.connection = {
        "moonrakersocketurl": config.moonrakersocketurl,
        "moonrakerurl": config.moonrakerurl,
        "bottoken": config.bottoken,
        "botapplicationkey": config.botapplicationkey,
        "botapplicationid": config.botapplicationid
    }
    newConfig.status = {
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
    newConfig.permission = {
        "controller": [config.masterid],
        "guild_admin_as_bot_admin": true
    }
    newConfig.webcam = {
        "url": config.webcamsnapshoturl,
        "quality": 80,
        "rotation": 0,
        "brightness": 0,
        "contrast": 0,
        "vertical_mirror": false,
        "horizontal_mirror": false,
        "greyscale": false
    }
    saveData(newConfig, `${args[1]}/mooncord.json`)
}
async function migrateDatabase() {
    const firstDatabasePath = path.resolve(__dirname, '../discorddatabase.json')
    try {
        if (fs.existsSync(firstDatabasePath)) {
            console.log(logSymbols.info, 'Migrate 0.0.1 Database to 0.0.2 Database'.database)
            const firstDatabase = require('../discorddatabase.json')
            let newDatabase = {
                "version": "0.0.2",
                "guilds": firstDatabase
            }

            const stringNewDatabase = JSON.stringify(newDatabase)
                .replace(/(statuschannels)/g, 'broadcastchannels')
            
            newDatabase = JSON.parse(stringNewDatabase)

            for (const guildid in newDatabase.guilds) {
                newDatabase.guilds[guildid].accessrole = undefined
                newDatabase.guilds[guildid].accessusers = undefined
                newDatabase.guilds[guildid].accesseveryone = undefined
            }
            
            saveData(newDatabase, '../database.json')

            await fs.unlinkSync(firstDatabasePath)
        }
    } catch (error) {
        console.error((error).error)
    }
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