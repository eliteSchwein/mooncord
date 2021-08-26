const variables = require('../../utils/variablesUtil')

module.exports = (data, connection, discordClient, database) => {
    loopTempSensors(data)
}

function loopTempSensors(data) {
    Object.keys(data).forEach(tempSensor => {
      if (typeof(data[tempSensor].temperature) !== 'undefined') {
            variables.setTemperature(tempSensor, data[tempSensor].temperature)
      }
    })
}