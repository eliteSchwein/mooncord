const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')
const states = require('./klipper_states.json')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) === 'undefined') { return }
    if (!Object.keys(states).includes(methode)) { return }
    variables.setStatus(states[methode].status)
    status.triggerStatusUpdate(discordClient)
  }
}
module.exports = event
