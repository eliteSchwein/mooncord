const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson
    if (typeof (result) !== 'undefined' && typeof (result.status) !== 'undefined') {
      const klipperstatus = result.status
      if (typeof (klipperstatus.print_stats) !== 'undefined') {
        const printfile = klipperstatus.print_stats.filename
        variables.setCurrentFile(printfile)
        const printduration = klipperstatus.print_stats.print_duration.toFixed(0)
        const remainingprinttime = variables.getPrintTime() - printduration
        variables.setRemainingTime(remainingprinttime)
        if (klipperstatus.print_stats.state === 'paused') {
          const currentStatus = 'pause'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            status.triggerStatusUpdate(discordClient)
            clearInterval(variables.getUpdateTimer())
          }
        }
        if (klipperstatus.print_stats.state === 'printing' && (typeof (printfile) !== 'undefined' || printfile !== '')) {
          const currentStatus = 'printing'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            if (!config.status.use_percent) {
              status.triggerStatusUpdate(discordClient)
              setTimeout(() => {
                const timer = setInterval(() => {
                  status.triggerStatusUpdate(discordClient)
                }, 1000 * config.status.update_interval)
                variables.setUpdateTimer(timer)
              }, 1000 * config.status.update_interval)
            } else {
              status.triggerStatusUpdate(discordClient)
            }
          }
        }
        if (klipperstatus.print_stats.state === 'complete' && variables.getStatus() !== 'ready') {
          const currentStatus = 'done'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
            variables.updateLastGcodeFile()
            status.triggerStatusUpdate(discordClient)
            clearInterval(variables.getUpdateTimer())
            setTimeout(() => {
              variables.setStatus('ready')
              status.triggerStatusUpdate(discordClient)
            }, 1000)
          }
        }
      }
    }
  }
}
module.exports = event
