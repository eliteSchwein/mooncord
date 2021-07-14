const { waitUntil } = require('async-wait-until')
const logSymbols = require('log-symbols')
const Discord = require('discord.js')
const path = require('path')

const status = require('../utils/statusUtil')
const locale = require('../utils/localeUtil')
const chatUtil = require('../utils/chatUtil')

let posted = []
let notThrottledCounter = 30

const validFlags = [
  'Frequency Capped',
  'Under-Voltage Detected',
  'Temperature Limit Active'
]

const event = (message, connection, discordClient, database) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  if (typeof (messageJson.result) === 'undefined') { return }
  if (typeof (messageJson.result.moonraker_stats) !== 'undefined') {
    retrieveStats(messageJson.result.moonraker_stats)
  }
  if (typeof (messageJson.result.throttled_state) !== 'undefined') {
    retrieveThrottle(messageJson.result.throttled_state, discordClient, database)
  }
}
function retrieveStats(result) {
  //console.log(result)
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
    if (validFlags.includes(flag)) {

      notThrottledCounter = 30

      if (!posted.includes(flag)) {
        posted.push(flag)
        postThrottle(flag, discordClient, database)
      }
    }
  }
}

async function postThrottle(throttle, discordClient, database) {
  await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1000 })

  const key = throttle
    .toLowerCase()
    .replace(' ', '_')
    .replace('-', '_')
  
  const sentence = locale.throttle.sentence
    .replace(/(\${reason})/g, `\`${locale.throttle.reasons[key].name}\``)
  const suggestion = locale.throttle.reasons[key].suggestion
  
  console.log(logSymbols.warning, `A Throttle occured: ${throttle}!`.throttlewarn)
  
  const throttleEmbed = chatUtil.generateWarnEmbed(
    locale.throttle.title,
    `${sentence}
  ${suggestion}`)
  
  status.postBroadcastMessage(throttleEmbed, discordClient, database)
}
module.exports = event