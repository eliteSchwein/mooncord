const handlers = require('../buttons')

const enableEvent = (discordClient) => {
  discordClient.on('clickButton', (button) => {
    handlers(button, discordClient)
  })
}
module.exports = enableEvent