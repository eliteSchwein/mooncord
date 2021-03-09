const variables = require('../utils/variablesUtil')
const statusUtil = require('../utils/statusUtil')

const event = (message, connection, discordClient) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const {result} = messageJson
      if (typeof (result) !== 'undefined' && typeof (result.klippy_state) !== 'undefined') {
          const currentStatus = result.klippy_state
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            statusUtil.triggerStatusUpdate(discordClient)
          }
        }
    }
}
module.exports = event
