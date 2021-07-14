const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)

  console.log(messageJson)

  const { result } = messageJson

  if (typeof (result) === 'undefined') { return }
  if (typeof (result.job) === 'undefined') { return }

  variables.updateTimeData('actual_duration', job.print_duration)
  variables.updateTimeData('actual_total_duration', job.total_duration)
}
module.exports = event
