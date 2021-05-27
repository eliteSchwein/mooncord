const config = require('../statusconfig.json')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  const id = Math.floor(Math.random() * parseInt('10_000')) + 1
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const methode = messageJson.method
    if (typeof (methode) !== 'undefined' && methode === 'notify_gcode_response') {
      const { params } = messageJson
      if(params[0].startsWith("mooncord.broadcast")) {
        console.log(params[0].replace("mooncord.broadcast ", ""))
      }
    }
  }
}
module.exports = event
