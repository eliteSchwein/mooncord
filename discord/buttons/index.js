const printJob = require('./printJob')
const klipperRestart = require('./klipperRestart')
const updateSystem = require('./updateSystem')

module.exports = (button, discordClient) => {
  printJob(button, discordClient)
  klipperRestart(button, discordClient)
  updateSystem(button, discordClient)
}