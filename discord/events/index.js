const printjobstart = require('./printjobstart')
const printlist = require('./printlist')
const upload = require('./upload')

const enableEvent = function (discordClient) {
  upload(discordClient)
  printjobstart(discordClient)
  printlist(discordClient)
}
module.exports = enableEvent