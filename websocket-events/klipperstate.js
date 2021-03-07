const variables = require('../utils/variablesUtil')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const result = messageJson.result
      if (typeof (result) !== 'undefined') {
        if (typeof (result.klippy_state) !== 'undefined') {
          const currentStatus = result.klippy_state
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            variables.triggerStatusUpdate(discordClient)
          }
        }
      }
    }
  })
}
module.exports = event
