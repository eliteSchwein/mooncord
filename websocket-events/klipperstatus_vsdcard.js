const config = require('../config.json')

const variables = require('../utils/variablesUtil')
const status = require('../utils/statusUtil')

const event = (message, connection, discordClient) => {
  const id = Math.floor(Math.random() * 10000) + 1
  if (message.type === 'utf8') {
    const messageJson = JSON.parse(message.utf8Data)
    const { result } = messageJson

    retrieveSoftwareVersion(result)

    if (hasCorrectData(result)) {
      const virtualSDcard = result.status.virtual_sdcard
      const currentProgress = calculateProgress(virtualSDcard)

      if (variables.getStatus() !== 'printing') { return }

      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentFile()}"}, "id": ${id}}`)

      if (currentProgress.toFixed(0) === 0) { return }
      if (currentProgress.toFixed(0) === 100) { return }
      if (currentProgress.toFixed(0) === variables.getProgress()) { return }

      discordClient.user.setActivity(`Printing: ${currentProgress.toFixed(0)}%`, { type: 'WATCHING' })
      variables.setProgress(currentProgress.toFixed(0))

      if (config.statusupdatepercent &&
        currentProgress.toFixed(0) % config.statusupdateinterval === 0) {
        status.triggerStatusUpdate(discordClient)
      }
    }
  }
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
