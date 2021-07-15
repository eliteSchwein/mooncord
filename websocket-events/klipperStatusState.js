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

      if (variables.getTimes().duration === 0 ||
        variables.getTimes().total === 0 ||
        variables.getTimes().left === -Infinity) { return }
      if (variables.getMaxLayers === 0) { return }
      if (status.getStatus() === 'printing') { return }
      
      status.changeStatus(discordClient, 'start')
      status.changeStatus(discordClient, 'printing')

      if (config.status.use_percent) { return }

      const timer = setInterval(() => {
        status.changeStatus(discordClient, 'printing')
      }, 1000 * config.status.update_interval)
      variables.setUpdateTimer(timer)
    }
    if (klipperstatus.print_stats.state === 'complete' && status.getStatus() !== 'ready') {

      timelapseUtil.render()
      variables.updateLastGcodeFile()
      await status.changeStatus(discordClient, 'done')
      
      clearInterval(variables.getUpdateTimer())

      setTimeout(() => {
        status.changeStatus(discordClient, 'ready')
      }, 1000)
    }
  }
}
module.exports = event
