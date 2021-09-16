const args = process.argv.slice(2)

const logSymbols = require('log-symbols')

const chatUtil = require('../utils/chatUtil')
const locale = require('../utils/localeUtil')
const status = require('../utils/statusUtil')
const fs = require("fs");



const configData = fs.readFileSync(`${args[0]}/mooncord.json`, {encoding: 'utf8'})
const config = JSON.parse(configData)

let posted = []
let notThrottledCounter = 30

const validFlags = new Set([
  'Frequency Capped',
  'Under-Voltage Detected',
  'Temperature Limit Active'
])

const event = (message, connection, discordClient, database) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  
  if (typeof (messageJson.method) === 'undefined') { return }
  if (messageJson.method !== 'notify_cpu_throttled') { return }

  if (typeof (messageJson.params) === 'undefined') { return }
  if (typeof (messageJson.params[0].throttled_state) !== 'undefined') {
    retrieveStats(messageJson.params[0].throttled_state)
  }
  if (!config.system_notifications.moonraker_throttle) { return }
  if (typeof (messageJson.params[0].throttled_state) !== 'undefined') {
    retrieveThrottle(messageJson.params[0].throttled_state, discordClient, database)
  }
}
function retrieveStats(result) {
  // console.log(result)
}
function retrieveThrottle(result, discordClient, database) {
  const { flags } = result
  if (!flags.includes('Currently Throttled')) {
    if (notThrottledCounter === 0) {
      posted = []
      return
    }
    notThrottledCounter--
    return
  }
  for (const index in flags) {
    const flag = flags[index]
    if (validFlags.has(flag)) {

      notThrottledCounter = 30

      if (!posted.includes(flag)) {
        posted.push(flag)
        postThrottle(flag, discordClient, database)
      }
    }
  }
}

async function postThrottle(throttle, discordClient, database) {
  const key = throttle
    .toLowerCase()
    .replace(' ', '_')
    .replace('-', '_')
  
  const sentence = locale.throttle.sentence
    .replace(/(\${reason})/g, `\`${locale.throttle.reasons[key].name}\``)
  const {suggestion} = locale.throttle.reasons[key]
  
  console.log(logSymbols.warning, `A Throttle occured: ${throttle}!`.throttlewarn)
  
  const throttleEmbed = chatUtil.generateWarnEmbed(
    locale.throttle.title,
    `${sentence}
  ${suggestion}`)
  
  await status.postBroadcastMessage(throttleEmbed, discordClient, database)
}
module.exports = event