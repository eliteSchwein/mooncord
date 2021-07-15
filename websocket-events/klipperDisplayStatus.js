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

  postProgress(discordClient, progress, variables.getProgress())
  
  variables.setProgress((progress * 100).toFixed())
}

function postProgress(discordClient, progress, oldProgress) {
  console.log(progress + ' ' + oldProgress)
  console.log(config.status.update_interval &&
    progress.toFixed() % config.status.update_interval === 0 &&
    progress.toFixed() !== 0)
  if (oldProgress === progress) { return }
  
  discordClient.user.setActivity(
    locale.status.printing.activity.replace(/(\${value_print_progress})/g, variables.getProgress())
    , { type: 'WATCHING' })
  

  if (config.status.update_interval &&
    progress.toFixed() % config.status.update_interval === 0 &&
    progress.toFixed() !== 0) {
      statusUtil.changeStatus(discordClient, 'printing')
  }
}
module.exports = event
