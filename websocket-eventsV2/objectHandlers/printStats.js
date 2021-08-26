const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const status = require('../../utils/statusUtil')
const timelapseUtil = require('../../utils/timelapseUtil')
const variables = require('../../utils/variablesUtil')

module.exports = async (data, connection, discordClient, database) => {
    if (typeof (data.print_stats) === 'undefined') { return }

    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const stats = data.print_stats

    retrieveFilename(stats)
    retrieveDuration(stats)

    
    if (typeof (stats.state) === 'undefined') { return }
    
    if (stats.state === 'paused') {  
      
      await status.changeStatus(discordClient, 'pause')
      
      clearInterval(variables.getUpdateTimer())
    }
    if (stats.state === 'printing' &&
        (typeof (variables.getCurrentPrintJob()) !== 'undefined' ||
        variables.getCurrentPrintJob() !== '')) {
      
      if (status.getStatus() === 'printing' ||
        status.getStatus() === 'start') { return }
        
      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentPrintJob()}"}, "id": ${id}}`)
      
      timelapseUtil.start()
      
      await status.changeStatus(discordClient, 'start')
      await status.changeStatus(discordClient, 'printing')

      if (config.status.use_percent) { return }

      const timer = setInterval(() => {
        status.changeStatus(discordClient, 'printing')
      }, 1000 * config.status.update_interval)
      variables.setUpdateTimer(timer)
    }
    if (stats.state === 'complete' && status.getStatus() !== 'ready') {

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

function retrieveFilename(stats) {
    if (typeof (stats.filename) === 'undefined') { return }

    variables.setCurrentPrintJob(stats.filename)
}

function retrieveDuration(stats) {
    if (typeof (stats.print_duration) === 'undefined') { return }

    variables.updateTimeData('duration', stats.print_duration)
}