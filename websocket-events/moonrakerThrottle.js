const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    console.log(messageJson)
    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.status) === 'undefined') { return }
  }
}
module.exports = event