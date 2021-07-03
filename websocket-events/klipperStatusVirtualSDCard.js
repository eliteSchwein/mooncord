const args = process.argv.slice(2)

const { waitUntil } = require('async-wait-until')

const config = require(`${args[0]}/mooncord.json`)
const locale = require('../utils/localeUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

let lastProgress = 0

const event = async (message, connection, discordClient) => {
  const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson

    retrieveSoftwareVersion(result)

    retrieveLayerHeight(result)

    if (hasCorrectData(result)) {
      const virtualSDcard = result.status.virtual_sdcard
      const currentProgress = calculateProgress(virtualSDcard)

      if (variables.getStatus() !== 'printing') { return }

      if (currentProgress.toFixed(0) === 0) { return }
      if (currentProgress.toFixed(0) === 100) { return }
      if (currentProgress.toFixed(0) === variables.getProgress()) { return }

      await waitUntil(() => discordClient.user !== null, { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 1000 })
      
      discordClient.user.setActivity(
        locale.status.printing.activity.replace(/(\${value_print_progress})/g, currentProgress.toFixed(0))
        , { type: 'WATCHING' })
      variables.setProgress(currentProgress.toFixed(0))

      if (currentProgress.toFixed(0) === lastProgress) { return }

      if (config.status.update_interval &&
        currentProgress.toFixed(0) % config.status.update_interval === 0 &&
        currentProgress.toFixed(0) !== 0) {
        lastProgress = currentProgress.toFixed(0)
        status.triggerStatusUpdate(discordClient)
        console.log('trigger by klipperStatusVirtualSDCard '+variables.getStatus())
      }
    }
  }
}

function retrieveLayerHeight(result) {
  if (typeof (result) === 'undefined') {
    return
  }
  if (typeof (result.status) === 'undefined') {
    return
  }
  if (typeof (result.status.gcode_move) === 'undefined') {
    return
  }
  const {gcode_position} = result.status.gcode_move
  variables.setCurrentLayer(gcode_position[2])
}

function retrieveSoftwareVersion(result) {
  if (typeof (result) === 'undefined') {
    return
  }
  if (typeof (result.version_info) === 'undefined') {
    return
  }
  variables.setVersions(result.version_info)
}

function hasCorrectData(result) {
  if (typeof (result) === 'undefined') {
    return false
  }
  if (typeof (result.status) === 'undefined') {
    return false
  }
  if (typeof (result.status.virtual_sdcard) === 'undefined') {
    return false
  }
  return true
}

function calculateProgress(virtual_sdcard) {
  let currentProgress = 0
  if (virtual_sdcard.file_position <= variables.getStartByte()) {
    currentProgress = 0
    variables.setProgress(currentProgress)
  } else if (virtual_sdcard.file_position >= variables.getEndByte()) {
    currentProgress = 100
    variables.setProgress(currentProgress)
  } else {
    const currentPosition = virtual_sdcard.file_position - variables.getStartByte()
    const maxPosition = variables.getEndByte() - variables.getStartByte()
    if (currentPosition > 0 && maxPosition > 0) {
      currentProgress = (1 / maxPosition * currentPosition) * 100
    } else {
      currentProgress = virtual_sdcard.progress
    }
  }
  return currentProgress
}
module.exports = event
