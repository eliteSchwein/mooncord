const handlers = require('../buttons')

let discordClient

const enableEvent = (dcClient) => {
  discordClient = dcClient
  discordClient.on('clickButton', (button) => {
    handlers(button)
  })
}
module.exports = enableEvent