const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const methode = messageJson.method
      if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_ready') {
          const currentStatus = 'ready'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            variables.triggerStatusUpdate(discordClient)
          }
        }
    }
}
module.exports = event
