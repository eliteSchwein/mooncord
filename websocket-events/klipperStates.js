const args = process.argv.slice(2)

const Discord = require('discord.js')

const status = require('../utils/statusUtil')
const timelapseUtil = require('../utils/timelapseUtil')
const variables = require('../utils/variablesUtil')
const states = require('./klipper_states.json')

const config = require(`${args[0]}/mooncord.json`)

const event = async (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const methode = messageJson.method
  const { params } = messageJson
  if (typeof (methode) === 'undefined') { return }
  if (!Object.keys(states).includes(methode)) { return }

  if (typeof (states[methode].preventStatus) !== 'undefined' && states[methode].preventStatus.some(invalidState => variables.getStatus() === invalidState)) { return }
  
  if (typeof (states[methode].requiredParams) !== 'undefined') {
    if (typeof (params) === 'undefined') { return }
    if (!states[methode].requiredParams.some(param => params.includes(param))) { return }
  }

  if (variables.getStatus() === states[methode].status) { return }

  if (typeof (states[methode].timedStatus) !== 'undefined') {
    changeStatusLater(states[methode].timedStatus, discordClient)
  }

  variables.setStatus(states[methode].status)
  variables.updateLastGcodeFile()
  await status.triggerStatusUpdate(discordClient)

  if(typeof(states[methode].render) === 'undefined') { return }

  if (states[methode].render) {
    await timelapseUtil.render()
    if (config.timelapse.post_at_print_end) {
      status.postBroadcastMessage(timelapseUtil.getEmbed(), discordClient)
    }
  }
}

function changeStatusLater(state, discordClient) {
  setTimeout(() => {
    variables.setStatus(state)
    status.triggerStatusUpdate(discordClient)
  }, 2000)
}
module.exports = event
