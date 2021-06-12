const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')
const timelapseUtil = require('../utils/timelapseUtil')

const event = (message, connection, discordClient) => {
  const id = Math.floor(Math.random() * parseInt('10_000')) + 1
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    let timer
    if (typeof (methode) !== 'undefined' && methode === 'notify_gcode_response') {
      const { params } = messageJson
      if (params[0].startsWith('File opened')) {
        const removeSize = params[0].slice(0, Math.max(0, params[0].indexOf(' Size')))
        const removeFileTag = removeSize.slice(12)
        const printfile = removeFileTag
        const currentStatus = 'start'
        connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${printfile}"}, "id": ${id}}`)
        if (variables.getStatus() !== currentStatus) {
          variables.setStatus(currentStatus)
          timelapseUtil.start()
          status.triggerStatusUpdate(discordClient.getClient())
        }
        variables.setStatus('printing')
        if (!config.status.use_percent) {
          timer = setInterval(() => {
            status.triggerStatusUpdate(discordClient.getClient())
          }, 1000 * config.status.update_interval)
          variables.setUpdateTimer(timer)
        }
      }
    }
  }
}
module.exports = event
