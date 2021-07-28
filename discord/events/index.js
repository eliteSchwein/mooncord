const printJobStart = require('./printJobStart')
const upload = require('./upload')
const buttonClick = require('./buttonClick')

const enableEvent = function (discordClient) {
  upload(discordClient)
  printJobStart(discordClient)
  buttonClick(discordClient)
}
module.exports = enableEvent