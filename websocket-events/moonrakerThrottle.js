const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.moonraker_stats) !== 'undefined') {
      retrieveStats(messageJson.result.moonraker_stats)
    }
    if (typeof (messageJson.result.throttled_state) !== 'undefined') {
      retrieveThrottle(messageJson.result.throttled_state)
    }
  }
}
function retrieveStats(result) {
  console.log(result)
}
function retrieveThrottle(result) {
  console.log(result)
}
module.exports = event