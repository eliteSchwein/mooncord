const args = process.argv.slice(2)

const logSymbols = require('log-symbols')

const config = require(`${args[0]}/mooncord.json`)

module.exports.migrate = async () => {
  console.log(typeof (config.connection.moonraker_token))
  if (typeof (config.connection.moonraker_token) === undefined) {
    config.connection.moonraker_token = ""
    await saveData()
  }
}

async function saveData() {
    await fs.writeFileSync(path.resolve(`${args[0]}/mooncord.json`), JSON.stringify(config, null, 4))
    console.log(logSymbols.info, `The Config got updated!`.database)
}