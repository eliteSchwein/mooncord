const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson
  if (typeof (result) !== 'undefined' && typeof (result.version_info) !== 'undefined') {
    variables.setVersions(result.version_info)
  }
}
module.exports = event
