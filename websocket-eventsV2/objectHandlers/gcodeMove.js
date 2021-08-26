const variables = require('../../utils/variablesUtil')

module.exports = (data, connection, discordClient, database) => {
    if (typeof (data.gcode_move) === 'undefined') { return }
    
    retrieveSpeedFactor(data.gcode_move)
    retrieveCurrentLayer(data.gcode_move)
}

function retrieveSpeedFactor(gcodeMoveData) {
    if (typeof (gcodeMoveData.speed_factor) === 'undefined') { return }
    variables.updateTimeData('multiplier', codeMoveData.speed_factor || 1)
}

function retrieveCurrentLayer(gcodeMoveData) {
    if (typeof (gcodeMoveData.gcode_position) === 'undefined') { return }
    variables.setCurrentLayer(gCodeMoveData.gcode_position[2])
}