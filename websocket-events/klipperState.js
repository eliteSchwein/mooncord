const status = require('../utils/statusUtil')

const event = (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)

  console.log(messageJson)
  const { result } = messageJson

  if(typeof (result) === 'undefined') { return }
  if (typeof (result.klippy_state) === 'undefined') { return }
  
  const currentStatus = result.klippy_state

  status.changeStatus(discordClient, currentStatus)
}
module.exports = event
