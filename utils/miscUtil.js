const statusconfig = require('../statusconfig.json')
const database = require('./databaseUtil')

module.exports.init = () => {
  if (statusconfig.use_percent) {
    setInterval(() => {
        const ramDatabase = database.getRamDatabase()
      const currentTime = ramDatabase.cooldown
      console.log("time "+currentTime)
        database.updateRamDatabase("cooldown", currentTime-1)
    }, 1000)
  }
}