const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = async (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson

    if(typeof (result) === 'undefined') { return }
    if (typeof (result.klippy_state) === 'undefined') { return }
    
    const currentStatus = result.klippy_state
    if (variables.getStatus() === currentStatus) { return }
      console.log('klipperState ' + currentStatus)
    variables.setStatus(currentStatus)
    await status.triggerStatusUpdate(discordClient)
  }
}
module.exports = event
