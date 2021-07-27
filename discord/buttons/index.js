const test = require('./test')
const printJob = require('./printJob')
module.exports = (button, discordClient) => {
  test(button, discordClient)
  printJob(button, discordClient)
}