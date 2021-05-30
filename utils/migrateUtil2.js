const args = process.argv.slice(2)

const fs = require('fs')
const logSymbols = require('log-symbols');
const path = require('path')
const colors = require('colors')

const config = require(args[0] + 'config.json')


colors.setTheme({
  database: 'grey',
  error: 'brightRed'
});

execute()

async function execute() {
    //await migrateDatabase()
    migrateConfigToMultiV1()
}

function migrateConfigToMultiV1() {
    console.log(logSymbols.info, 'Migrate 0.0.2 Config to 0.0.3 Multi Config'.database)
    const statusconfig = {
        "update_interval": config.statusupdateinterval,
        "use_percent": config.statusupdatepercent,
        "min_interval": 15
    }
    saveData(statusconfig, args[1] + 'mooncord-status.json')
    const webcamconfig = {
        "url": config.webcamsnapshoturl,
        "quality": 80,
        "rotation": 0,
        "vertical_mirror": false,
        "horizontal_mirror": false
    }
    saveData(webcamconfig, args[1] + 'mooncord-webcam.json')
    config.statusupdateinterval = undefined
    config.statusupdatepercent = undefined
    config.webcamsnapshoturl = undefined
    saveData(config,  args[1] + 'mooncord.json')
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