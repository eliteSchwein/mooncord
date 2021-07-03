const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson

    if (typeof (result) === 'undefined') { return }

    console.log(result)
    if (typeof (result.gcode_start_byte) === 'undefined') { return }

    if (typeof (result.thumbnails) !== 'undefined') {
        variables.setThumbnailPath(result.thumbnails[1].relative_path)
    }

    variables.setStartByte(result.gcode_start_byte)
    variables.setEndByte(result.gcode_end_byte)
    variables.setPrintTime(result.estimated_time)
    variables.setLayerHeights(result.layer_height,
      result.object_height, result.first_layer_height)
  }
}
module.exports = event
