const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const {result} = messageJson
    if (typeof (result) !== 'undefined') {
      if (typeof (result.thumbnails) !== 'undefined') {
        variables.setThumbnail(result.thumbnails[1].data)
      }
      if (typeof (result.gcode_start_byte) !== 'undefined') {
        variables.setStartByte(result.gcode_start_byte)
      }
      if (typeof (result.gcode_end_byte) !== 'undefined') {
        variables.setEndByte(result.gcode_end_byte)
      }
      if (typeof (result.estimated_time) !== 'undefined') {
        variables.setPrintTime(result.estimated_time)
      }
    }
  }
}
module.exports = event
