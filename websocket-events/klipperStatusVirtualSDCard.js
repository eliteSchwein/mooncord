const variables = require('../utils/variablesUtil')

const event = async (message) => {
  if (message.type !== 'utf8') { return }
  const messageJson = JSON.parse(message.utf8Data)

  if (typeof (messageJson.method) === 'undefined') { return }
  if (messageJson.method !== 'notify_status_update') { return }

  if (typeof (messageJson.params) === 'undefined') { return }

  retrieveSoftwareVersion(messageJson.params[0])

  retrieveGGodeMove(messageJson.params[0])
}

function retrieveGGodeMove(result) {
  if (typeof (result) === 'undefined') { return }
  if (typeof (result) === 'undefined') { return }
  if (typeof (result.gcode_move) === 'undefined') { return }

  const gCodeMoveData = result.gcode_move
  variables.updateTimeData('multiplier', gCodeMoveData.speed_factor || 1)
  variables.setCurrentLayer(gCodeMoveData.gcode_position[2])
}

function retrieveSoftwareVersion(result) {
  if (typeof (result) === 'undefined') { return }
  if (typeof (result.version_info) === 'undefined') { return }

  variables.setVersions(result.version_info)
}

module.exports = event
