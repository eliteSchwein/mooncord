const upload = require('./upload')
const printjobstart = require('./printjobstart')

const enableEvent = function (discordClient) {
  upload(discordClient)
  printjobstart(discordClient)
}
module.exports = enableEvent