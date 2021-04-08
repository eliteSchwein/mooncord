const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson
    if (typeof (result) !== 'undefined' && typeof (result.klippy_state) !== 'undefined') {
      const currentStatus = result.klippy_state
      console.log(currentStatus)
      if (variables.getStatus() !== currentStatus) {
        variables.setStatus(currentStatus)
        status.triggerStatusUpdate(discordClient)
      }
    }
  }
}
module.exports = event
