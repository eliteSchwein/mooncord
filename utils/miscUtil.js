const variables = require('./variablesUtil')
const statusconfig = require(variables.getConfigPath() + '/statusconfig.json')
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