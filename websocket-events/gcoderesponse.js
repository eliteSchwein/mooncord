const variables = require('../utils/variablesUtil')
const config = require('../config.json')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    const id = Math.floor(Math.random() * 10000) + 1
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const methode = messageJson.method
      const result = messageJson.result
      let timer
      if (typeof (methode) !== 'undefined') {
        if (methode == 'notify_gcode_response') {
          const params = messageJson.params
          if (params[0].startsWith('File opened')) {
            const removeSize = params[0].substring(0, params[0].indexOf(' Size'))
            const removeFileTag = removeSize.substring(12)
            printfile = removeFileTag
            connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "' + printfile + '"}, "id": ' + id + '}')
            currentStatus = 'start'
            if (variables.getStatus() != currentStatus) {
              variables.setStatus(currentStatus)
              variables.triggerStatusUpdate(discordClient)
            }
            variables.setStatus('printing')
            if (!config.statusupdatepercent) {
              timer = setInterval(function () {
                variables.triggerStatusUpdate(discordClient)
              }, 1000 * config.statusupdateinterval)
              variables.setUpdateTimer(timer)
            }
          }
          if (params[0] == '// action:cancel') {
            currentStatus = 'stop'
            if (variables.getStatus() != currentStatus) {
              variables.setStatus(currentStatus)
              variables.triggerStatusUpdate(discordClient)
              clearInterval(variables.getUpdateTimer())
            }
            setTimeout(function () {
              variables.setStatus('ready')
              variables.triggerStatusUpdate(discordClient)
            }, 2000)
          }
        }
      }
    }
  })
}
module.exports = event
