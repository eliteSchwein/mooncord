const upload = require('./upload')
const buttonClick = require('./buttonClick')

const enableEvent = function (discordClient) {
  upload(discordClient)
  buttonClick(discordClient)
}
module.exports = enableEvent