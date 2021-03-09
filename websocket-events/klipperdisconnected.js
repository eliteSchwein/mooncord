const variables = require('../utils/variablesUtil')
const statusUtil = require('../utils/statusUtil')

const event = (message, connection, discordClient) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const methode = messageJson.method
      if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_disconnected') {
          const currentStatus = 'disconnected'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            statusUtil.triggerStatusUpdate(discordClient)
          }
        }
    }
}
module.exports = event
