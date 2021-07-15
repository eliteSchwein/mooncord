const variables = require('../utils/variablesUtil')

const event = async (message, connection, discordClient) => {
  const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const methode = messageJson.method
  let timer
  if (typeof (methode) !== 'undefined' && methode === 'notify_gcode_response') {
    const { params } = messageJson
    if (params[0].startsWith('File opened')) {
      const removeSize = params[0].slice(0, Math.max(0, params[0].indexOf(' Size')))
      const removeFileTag = removeSize.slice(12)
      const printfile = removeFileTag

      variables.updateTimeData('duration', 0)

      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${printfile}"}, "id": ${id}}`)

      variables.setCurrentPrintJob(printfile)
    }
  }
}
module.exports = event
