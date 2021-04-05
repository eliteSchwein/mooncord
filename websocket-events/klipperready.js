const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')

const discordClient = require('../clients/discordclient')

const event = (message) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_ready') {
      const currentStatus = 'ready'
      if (variables.getStatus() !== currentStatus) {
        variables.setStatus(currentStatus)
        status.triggerStatusUpdate(discordClient)
        console.log(discordClient)
      }
    }
  }
}
module.exports = event
