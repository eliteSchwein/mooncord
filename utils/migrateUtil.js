const fs = require('fs')
const logSymbols = require('log-symbols');
const path = require('path')

module.exports = {}
module.exports.init = async () => {
    await migrateDatabase()
    migrateConfig()
}
function migrateConfig() {
    const config = require('../config.json')
    if (typeof (config.prefix) !== 'undefined') {
        console.log(logSymbols.info, `Migrate 0.0.1 Config to 0.0.2 Config`.database)
        config.prefix = undefined
        config.botapplicationkey = ""
        config.botapplicationid = ""
        saveData(config, '../config.json')
    }
}
async function migrateDatabase() {
    const firstDatabasePath = path.resolve(__dirname, '../discorddatabase.json')
    try {
        if (fs.existsSync(firstDatabasePath)) {
            console.log(logSymbols.info, `Migrate 0.0.1 Database to 0.0.2 Database`.database)
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
    } catch(error) {
        console.error((error).err)
    }
}

function saveData(datadata, datapath) {
  fs.writeFile(path.resolve(__dirname, datapath), JSON.stringify(datadata), (err) => {
    if (err) { throw err }
      console.log(logSymbols.info, 'The Data has been migrated!'.database)
      if (datapath === '../config.json') {
          console.log(logSymbols.warning, `Please Read the Update Notes, you need to reconfigure the Bot!`.database)
          process.exit(5)
      }
  })
}