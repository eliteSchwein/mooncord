const buttonClick = require('./buttonClick')
const selectClick = require('./selectClick')
const upload = require('./upload')

const enableEvent = (discordClient) => {
  upload(discordClient)
  buttonClick(discordClient)
  selectClick(discordClient)
}
module.exports = enableEvent