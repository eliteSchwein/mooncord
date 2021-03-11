const statusUtil = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_shutdown') {
      const currentStatus = 'shutdown'
      if (variables.getStatus() !== currentStatus) {
        variables.setStatus(currentStatus)
        statusUtil.triggerStatusUpdate(discordClient)
      }
    }
  }
}
module.exports = event
