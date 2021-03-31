const { variables, status } = require('../utils')

const event = (message) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) !== 'undefined' && methode === 'notify_klippy_shutdown') {
      const currentStatus = 'shutdown'
      if (variables.getStatus() !== currentStatus) {
        variables.setStatus(currentStatus)
        status.triggerStatusUpdate()
      }
    }
  }
}
module.exports = event
