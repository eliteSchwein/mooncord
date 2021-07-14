const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')
const states = require('./klipper_state.json')

const event = (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  if(typeof (result) === 'undefined') { return }
  if (typeof (result.klippy_state) === 'undefined') { return }
  
  const currentStatus = result.klippy_state
  if (variables.getStatus() === currentStatus) { return }

  console.log(typeof (states[currentStatus].prevent_status) !== 'undefined' && states[currentStatus].prevent_status.includes(variables.getStatus()))

  if (typeof (states[currentStatus].prevent_status) !== 'undefined' && states[currentStatus].prevent_status.includes(variables.getStatus())) { return }

  variables.setStatus(currentStatus)
  
  status.triggerStatusUpdate(discordClient)
}
module.exports = event
