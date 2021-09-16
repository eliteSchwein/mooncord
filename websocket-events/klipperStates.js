const args = process.argv.slice(2)

const status = require('../utils/statusUtil')
const timelapseUtil = require('../utils/timelapseUtil')
const variables = require('../utils/variablesUtil')
const states = require('./klipper_states.json')



const configData = fs.readFileSync(`${args[0]}/mooncord.json`, {encoding: 'utf8'})
const config = JSON.parse(configData)

const event = async (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }

  const messageJson = JSON.parse(message.utf8Data)
  const methode = messageJson.method
  const { params } = messageJson
  if (typeof (methode) === 'undefined') { return }
  if (!Object.keys(states).includes(methode)) { return }
  
  if (typeof (states[methode].required_params) !== 'undefined') {
    if (typeof (params) === 'undefined') { return }
    if (!states[methode].required_params.some(param => params.includes(param))) { return }
  }

  if (typeof (states[methode].timed_status) !== 'undefined') {
    changeStatusLater(states[methode].timed_status, discordClient)
  }

  variables.updateLastPrintJob()
  if(!await status.changeStatus(discordClient, states[methode].status)) { return }

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
    status.changeStatus(discordClient, state)
  }, 2000)
}
module.exports = event
