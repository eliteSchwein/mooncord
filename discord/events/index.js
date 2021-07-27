const printJobStart = require('./printJobStart')
const printList = require('./printList')
const upload = require('./upload')
const buttonClick = require('./buttonClick')

const enableEvent = function (discordClient) {
  upload(discordClient)
  printJobStart(discordClient)
  printList(discordClient)
  buttonClick(discordClient)
}
module.exports = enableEvent