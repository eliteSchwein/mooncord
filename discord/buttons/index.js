const test = require('./test')
const printJob = require('./printJob')
const klipperRestart = require('./klipperRestart')
module.exports = (button, discordClient) => {
  test(button, discordClient)
  printJob(button, discordClient)
  klipperRestart(button, discordClient)
}