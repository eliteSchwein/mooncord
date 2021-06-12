const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.status) === 'undefined') { return }

    if (typeof (messageJson.result.configfile) !== 'undefined') {
      loadMcu(messageJson.result.status.configfile.config)
      return
    }
  }
}
function loadMcu(config) {
  console.log(config)
  console.log(Object.fromEntries(Object.entries(config).filter(([key]) => key.match(/(mcu)/g))))

}
module.exports = event
