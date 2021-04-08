const config = require('../config.json')

const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')

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
            if (!config.statusupdatepercent) {
              status.triggerStatusUpdate(discordClient)
              setTimeout(() => {
                const timer = setInterval(() => {
                  status.triggerStatusUpdate(discordClient)
                }, 1000 * config.statusupdateinterval)
                variables.setUpdateTimer(timer)
              }, 1000 * config.statusupdateinterval)
            } else {
              status.triggerStatusUpdate(discordClient)
            }
          }
        }
        if (klipperstatus.print_stats.state === 'complete' && variables.getStatus() !== 'ready') {
          const currentStatus = 'done'
          if (variables.getStatus() !== currentStatus) {
            variables.setStatus(currentStatus)
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
