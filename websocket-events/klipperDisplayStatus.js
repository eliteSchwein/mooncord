const args = process.argv.slice(2)

const variables = require('../utils/variablesUtil')
const statusUtil = require('../utils/statusUtil')
const locale = require('../utils/localeUtil')

const config = require(`${args[0]}/mooncord.json`)

const event = (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }

  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  if (typeof (result) === 'undefined') { return }
  if (typeof (result.status) === 'undefined') { return }
  if (typeof (result.status.display_status) === 'undefined') { return }

  const progress = result.status.display_status.progress

  variables.updateTimeData('file_total_duration', variables.getTimes().duration / progress)

  postProgress(discordClient, (progress * 100).toFixed())
  
  variables.setProgress((progress * 100).toFixed())
}

function postProgress(discordClient, progress) {
  if (variables.getProgress() === progress) { return }
  
  discordClient.user.setActivity(
    locale.status.printing.activity.replace(/(\${value_print_progress})/g, variables.getProgress())
    , { type: 'WATCHING' })
  
  if (statusUtil.getStatus() !== 'printing') { return }

  if (config.status.update_interval &&
    progress % config.status.update_interval === 0 &&
    progress !== 0) {
      statusUtil.changeStatus(discordClient, 'printing')
  }
}
module.exports = event
