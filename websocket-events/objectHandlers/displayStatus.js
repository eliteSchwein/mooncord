const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const variables = require('../../utils/variablesUtil')
const statusUtil = require('../../utils/statusUtil')
const locale = require('../../utils/localeUtil')

module.exports = (data, connection, discordClient, database) => {
    if(typeof(data.display_status) === 'undefined') { return }

    const {progress} = data.display_status

    variables.updateTimeData('file_total_duration', variables.getTimes().duration / progress)

    if(variables.getProgress() === (progress * 100).toFixed(0)) { return }
  
    postProgress(discordClient, (progress * 100).toFixed(0))
    
    variables.setProgress((progress * 100).toFixed(0))
}

function postProgress(discordClient, progress) {
  if (statusUtil.getStatus() !== 'printing') { return }
  
  discordClient.user.setActivity(
    locale.status.printing.activity.replace(/(\${value_print_progress})/g, progress)
    , { type: 'WATCHING' })

  if (config.status.update_interval &&
    progress % config.status.update_interval === 0 &&
    progress !== 0) {
      statusUtil.changeStatus(discordClient, 'printing')
  }
}