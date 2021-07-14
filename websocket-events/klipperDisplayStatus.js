const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type !== 'utf8') { return }

  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  if (typeof (result) === 'undefined') { return }
  if (typeof (result.status) === 'undefined') { return }
  if (typeof (result.status.display_status) === 'undefined') { return }

  const progress = result.status.display_status.progress

  variables.updateTimeData('file_total_duration', variables.getTimes().duration / progress)
}
module.exports = event
