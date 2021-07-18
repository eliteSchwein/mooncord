const variables = require('../utils/variablesUtil')

const event = async (message) => {
  if (message.type !== 'utf8') { return }
  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  retrieveSoftwareVersion(result)

  retrieveGGodeMove(result)
}

function retrieveGGodeMove(result) {
  if (typeof (result) === 'undefined') { return }
  if (typeof (result.status) === 'undefined') { return }
  if (typeof (result.status.gcode_move) === 'undefined') { return }

  const gCodeMoveData = result.status.gcode_move
  variables.updateTimeData('multiplier', gCodeMoveData.speed_factor || 1)
  variables.setCurrentLayer(gCodeMoveData.gcode_position[2])
}

function retrieveSoftwareVersion(result) {
  if (typeof (result) === 'undefined') { return }
  if (typeof (result.version_info) === 'undefined') { return }

  variables.setVersions(result.version_info)
}

module.exports = event
