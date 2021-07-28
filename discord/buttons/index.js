const printJob = require('./printJob')
const klipperRestart = require('./klipperRestart')
const updateSystem = require('./updateSystem')
const listFiles = require('./listFiles')

module.exports = (button, discordClient) => {
  printJob(button, discordClient)
  klipperRestart(button, discordClient)
  updateSystem(button, discordClient)
  listFiles(button, discordClient)
}