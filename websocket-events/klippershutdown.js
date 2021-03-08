const variables = require('../utils/variablesUtil')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const methode = messageJson.method
      if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_shutdown') {
          const currentStatus = 'shutdown'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            variables.triggerStatusUpdate(discordClient)
          }
        }
    }
  })
}
module.exports = event
