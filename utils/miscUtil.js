const args = process.argv.slice(2)

const statusconfig = require(args[0] + 'statusconfig.json')
const database = require('./databaseUtil')

module.exports.init = () => {
  if (statusconfig.use_percent) {
    setInterval(() => {
      const ramDatabase = database.getRamDatabase()
      const currentTime = ramDatabase.cooldown
      if (currentTime > 0) {
        database.updateRamDatabase("cooldown", currentTime - 1)
      }
    }, 1000)
  }
}