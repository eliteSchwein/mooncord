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
    const thumbnail = result.thumbnails[result.thumbnails.length -1];
    variables.setThumbnailPath(thumbnail.relative_path)
  }
}
module.exports = event
