const variables = require('../utils/variablesUtil')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const result = messageJson.result
      if (typeof (result) !== 'undefined') {
        if (typeof (result.version_info) !== 'undefined') {
          variables.setVersions(result.version_info)
        }
      }
    }
  })
}
module.exports = event
