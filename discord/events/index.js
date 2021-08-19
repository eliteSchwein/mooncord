const upload = require('./upload')
const buttonClick = require('./buttonClick')
const selectClick = require('./selectClick')

const enableEvent = (discordClient) => {
  upload(discordClient)
  buttonClick(discordClient)
  selectClick(discordClient)
}
module.exports = enableEvent