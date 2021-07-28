const printJob = require('./printJob')
const printJobStart = require('./printJobStart')
const klipperRestart = require('./klipperRestart')
const updateSystem = require('./updateSystem')
const listFiles = require('./listFiles')

module.exports = (button, discordClient) => {
  printJob(button, discordClient)
  printJobStart(button, discordClient)
  klipperRestart(button, discordClient)
  updateSystem(button, discordClient)
  listFiles(button, discordClient)
}