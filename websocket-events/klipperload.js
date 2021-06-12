const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.status) === 'undefined') { return }

    const statusmessage = messageJson.result.status

    if (typeof (statusmessage.configfile) !== 'undefined') {
      loadMcuList(statusmessage.configfile.config)
      return
    }
  }
}

function loadMcuList(config) {
  variables.clearMCUList()
  Object.keys(config).forEach( key => {
    if (key.match(/(mcu)/g)) {
      variables.addToMCUList(key)
    }
  })
}

module.exports = event
