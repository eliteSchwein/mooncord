const data = {
  "layer": {
    "current": 0,
    "layer_height": 0,
    "object_height": 0,
    "first_layer_height": 0
  },
  "mcu_list": {},
  "invite_url": "",
  "update_timer": 0,
  "moonraker_versions": {},
  "print_job": {
    "status": "",
    "job_id": "",
    "current_file": "",
    "last_file": "",
    "start_byte": 0,
    "end_byte": 0,
    "thumbnail": "",
    "progress": 0,
    "times": {
      "multiplier": 0,
      "duration": 0,
      "actual_duration": 0,
      "actual_total_duration": 0,
      "slicer_total_duration": 0
    }
  }
}

module.exports.setCurrentLayer = (z) => { data.layer.current = z }
module.exports.setLayerHeights = (layerHeight, objectHeight, firstLayerHeight) => {
  data.layer.layer_height = layerHeight
  data.layer.object_height = objectHeight
  data.layer.first_layer_height = firstLayerHeight
}

module.exports.addToMCUList = (mcu) => { data.mcu_list[mcu] = null }
module.exports.updateMCUStatus = (mcu, status) => { data.mcu_list[mcu] = status }
module.exports.clearMCUList = () => { data.mcu_list = {} }

module.exports.setInviteUrl = (url) => { data.invite_url = url }
module.exports.setUpdateTimer = (newUpdateTimer) => { data.update_timer = newUpdateTimer }

module.exports.setStatus = (newStatus) => { data.print_job.status = newStatus }
module.exports.setVersions = (currentVersions) => { data.moonraker_versions = currentVersions }

module.exports.setCurrentPrintJob = (currentFile) => { data.print_job.current_file = currentFile }
module.exports.setStartByte = (startByte) => { data.print_job.start_byte = startByte }
module.exports.setEndByte = (endByte) => { data.print_job.end_byte = endByte }
module.exports.setThumbnailPath = (thumbnail) => { data.print_job.thumbnail = thumbnail }
module.exports.setProgress = (progress) => { data.print_job.progress = progress }
module.exports.setJobID = (id) => { data.print_job.job_id = id }
module.exports.updateTimeData = (key, times) => { data.print_job.times[key] = times }
module.exports.updateLastPrintJob = () => {
  data.print_job.last_file = data.print_job.current_file
  data.print_job.current_file = ''
}

module.exports.getMaxLayers = () => {
  const max = Math.ceil((data.layer.object_height - data.layer.first_layer_height) / data.layer.layer_height + 1)
  return max > 0 ? max : 0
}
module.exports.getCurrentLayer = () => {
  let current_layer = Math.ceil((data.layer.current - data.layer.first_layer_height) / data.layer.layer_height + 1)
  current_layer = (current_layer <= this.getMaxLayers()) ? current_layer : this.getMaxLayers()
  return current_layer > 0 ? current_layer : 0
}
module.exports.getLayerHeight = () => { return data.layer.layer_height }
module.exports.getObjectHeight = () => { return data.layer.object_height }
module.exports.getFirstLayerHeight = () => { return data.layer.first_layer_height }

module.exports.getMCUList = () => { return data.mcu_list }

module.exports.getConfigPath = () => {
  const args = process.argv.slice(2)
  return args[0]
}

module.exports.getInviteUrl = function() { return data.invite_url }
module.exports.getUpdateTimer = () => { return data.update_timer }

module.exports.getStatus = () => { return data.print_job.status }
module.exports.getVersions = () => { return data.moonraker_versions }

module.exports.getThumbnailPath = () => { return data.print_job.thumbnail }
module.exports.getCurrentPrintJob = () => { return data.print_job.current_file }
module.exports.getLastPrintJob = () => { return data.print_job.last_file }
module.exports.getProgress = () => { return data.print_job.progress }
module.exports.getStartByte = () => { return data.print_job.start_byte }
module.exports.getEndByte = () => { return data.print_job.end_byte }
module.exports.getJobID = () => { return data.print_job.job_id }
module.exports.getTimes = () => {
  const endTime = Math.floor(Date.now() / 1000)
  const duration = data.print_job.times.duration

  let total = data.print_job.times.actual_total_duration
  let actual = data.print_job.times.actual_duration

  if (actual === 0) {
    total = data.print_job.times.slicer_total_duration
    actual = data.print_job.times.slicer_total_duration
  }
  
  const left = (actual - duration) / data.print_job.times.multiplier
  const end = endTime + (total - duration)

  return {
    'total': total,
    'duration': duration,
    'left': left,
    'end': end
  }
}

module.exports.formatTime = (time) => { return formatTime(time / 1000) }

function formatTime(seconds) {
  if (isNaN(+seconds) || !isFinite(seconds)) seconds = 0
  let isNeg = false
  if (seconds < 0) {
    seconds = Math.abs(seconds)
    isNeg = true
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 3600 % 60)

  let r = s + 's' // always show seconds
  r = m + 'm ' + r // always show minutes
  if (h > 0) r = h + 'h ' + r // only show hours if relevent

  return (isNeg) ? '-' + r : r
}
