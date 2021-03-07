const variables = require('../utils/variablesUtil')
const config = require('../config.json')

const event = (connection, discordClient) => {
  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const result = messageJson.result
      if (typeof (result) !== 'undefined') {
        if (typeof (result.status) !== 'undefined') {
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
                variables.triggerStatusUpdate(discordClient)
                clearInterval(variables.getUpdateTimer())
              }
            }
            if (klipperstatus.print_stats.state === 'printing') {
              if (typeof (printfile) !== 'undefined' || printfile !== '') {
                const currentStatus = 'printing'
                if (variables.getStatus() !== currentStatus) {
                  variables.setStatus(currentStatus)
                  if (!config.statusupdatepercent) {
                    variables.triggerStatusUpdate(discordClient)
                    setTimeout(function () {
                      const timer = setInterval(function () {
                        variables.triggerStatusUpdate(discordClient)
                      }, 1000 * config.statusupdateinterval)
                      variables.setUpdateTimer(timer)
                    }, 1000 * config.statusupdateinterval)
                  } else {
                    variables.triggerStatusUpdate(discordClient)
                  }
                }
              }
            }
            if (klipperstatus.print_stats.state === 'complete') {
              if (variables.getStatus() !== 'ready') {
                const currentStatus = 'done'
                if (variables.getStatus() !== currentStatus) {
                  variables.setStatus(currentStatus)
                  variables.triggerStatusUpdate(discordClient)
                  clearInterval(variables.getUpdateTimer())
                  setTimeout(function () {
                    variables.setStatus('ready')
                    variables.triggerStatusUpdate(discordClient)
                  }, 1000)
                }
              }
            }
          }
        }
      }
    }
  })
}
module.exports = event
