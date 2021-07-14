const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  const { result } = messageJson

  if (typeof (result) === 'undefined') { return }
  if (typeof (result.gcode_start_byte) === 'undefined') { return }

  variables.setStartByte(result.gcode_start_byte)
  variables.setEndByte(result.gcode_end_byte)
  variables.setJobID(result.job_id)
  variables.updateTimeData('slicer_total_duration', result.estimated_time)
  variables.setLayerHeights(result.layer_height,
    result.object_height, result.first_layer_height)
  
  if (typeof (result.thumbnails) !== 'undefined') {
    variables.setThumbnailPath(result.thumbnails[1].relative_path)
  }
}
module.exports = event
