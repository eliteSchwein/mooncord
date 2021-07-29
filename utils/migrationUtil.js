const args = process.argv.slice(2)

const logSymbols = require('log-symbols')
const path = require('path')
const fs = require('fs')

const config = require(`${args[0]}/mooncord.json`)

module.exports.migrate = async () => {
  if (typeof (config.connection.moonraker_token) === 'undefined') {
    config.connection.moonraker_token = ""
    await saveData()
  }
}

async function saveData() {
    await fs.writeFile(path.resolve(`${args[0]}/mooncord.json`), JSON.stringify(config, null, 4))
    console.log(logSymbols.info, `The Config got updated!`.database)
}