const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  if (typeof (messageJson.result) === 'undefined') { return }
  if (typeof (messageJson.result.status) === 'undefined') { return }

  const statusmessage = messageJson.result.status

  if (typeof (statusmessage.configfile) !== 'undefined') {
    loadMCUList(statusmessage.configfile.config)
    return
  }
  if(/^(mcu)+(?!temp)$/g.test(JSON.stringify(statusmessage))) { retrieveMCUStatus(statusmessage) }
}

function loadMCUList(config) {
  variables.clearMCUList()
  Object.keys(config).forEach(key => {
    if (/^(mcu)+(?!temp)$/g.test(key)) {
      variables.addToMCUList(key)
    }
  })
}

function retrieveMCUStatus(message) {
  Object.keys(message).forEach(key => {
    if (/^(mcu)+(?!temp)$/g.test(key)) {
      variables.updateMCUStatus(key, message[key])
    }
  })
}

module.exports = event
