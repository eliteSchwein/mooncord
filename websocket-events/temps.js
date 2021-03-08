const variables = require('../utils/variablesUtil')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const {result} = messageJson
      if (typeof (result) !== 'undefined' && JSON.stringify(result).includes('temperature')) {
          variables.setTemps(result)
        }
    }
  })
}
module.exports = event
