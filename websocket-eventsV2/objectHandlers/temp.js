const variables = require('../../utils/variablesUtil')

module.exports = (data, connection, discordClient, database) => {
  if(!/(temp)/g.test(JSON.stringify(data))) { return }
  loopTempSensors(data)
}

function loopTempSensors(data) {
    Object.keys(data).forEach(tempSensor => {
      console.log(tempSensor)
      console.log(data[tempSensor])
      if (typeof(data[tempSensor].temperature) !== 'undefined') {
            variables.setTemperature(tempSensor, data[tempSensor].temperature)
      }
    })
}