const variables = require('../utils/variablesUtil')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    const id = Math.floor(Math.random() * 10000) + 1
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const methode = messageJson.method
      const result = messageJson.result
      if (typeof (methode) !== 'undefined') {
        if (methode == 'notify_klippy_disconnected') {
          currentStatus = 'disconnected'
          if (variables.getStatus() != currentStatus) {
            variables.setStatus(currentStatus)
            variables.triggerStatusUpdate(discordClient)
          }
        }
      }
    }
  })
}
module.exports = event
