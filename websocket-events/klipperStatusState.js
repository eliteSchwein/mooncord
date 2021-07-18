const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const status = require('../utils/statusUtil')
const timelapseUtil = require('../utils/timelapseUtil')
const variables = require('../utils/variablesUtil')

const event = async (message, connection, discordClient) => {
  if (message.type !== 'utf8') { return }

  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  if (typeof (result) === 'undefined') { return }
  if (typeof (result.status) === 'undefined') { return }

  const klipperstatus = result.status
  if (typeof (klipperstatus.print_stats) !== 'undefined') {
    const printfile = klipperstatus.print_stats.filename
    variables.setCurrentPrintJob(printfile)
    variables.updateTimeData('duration', klipperstatus.print_stats.print_duration)
    if (klipperstatus.print_stats.state === 'paused') {  
      
      await status.changeStatus(discordClient, 'pause')
      
      clearInterval(variables.getUpdateTimer())
    }
    if (klipperstatus.print_stats.state === 'printing' && (typeof (printfile) !== 'undefined' || printfile !== '')) {
      
      if (status.getStatus() === 'printing' ||
        status.getStatus() === 'start') { return }
      
      const times = variables.getTimes()

      if (times.duration === 0 ||
        times.total === 0 ||
        isNaN(times.total) ||
        isNaN(times.left) ||
        !isFinite(times.total) ||
        !isFinite(times.left)) { return }
      
      if (variables.getMaxLayers === 0) { return }
      
      if (variables.getProgress() === 100 ||
        variables.getProgress() === 0) { return }
      
      timelapseUtil.start()
      
      await status.changeStatus(discordClient, 'start')
      await status.changeStatus(discordClient, 'printing')

      if (config.status.use_percent) { return }

      const timer = setInterval(() => {
        status.changeStatus(discordClient, 'printing')
      }, 1000 * config.status.update_interval)
      variables.setUpdateTimer(timer)
    }
    if (klipperstatus.print_stats.state === 'complete' && status.getStatus() !== 'ready') {

      timelapseUtil.render()
      variables.updateLastPrintJob()
      await status.changeStatus(discordClient, 'done')
      if (config.timelapse.post_at_print_end) {
        status.postBroadcastMessage(timelapseUtil.getEmbed(), discordClient)
      }
      
      clearInterval(variables.getUpdateTimer())

      setTimeout(() => {
        status.changeStatus(discordClient, 'ready')
      }, 1000)
    }
  }
}
module.exports = event
