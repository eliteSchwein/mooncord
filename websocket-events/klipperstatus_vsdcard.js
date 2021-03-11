const config = require('../config.json')
const statusUtil = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')

const event = (message, connection, discordClient) => {
    const id = Math.floor(Math.random() * 10_000) + 1
    if (message.type === 'utf8') {
      const messageJson = JSON.parse(message.utf8Data)
      const {result} = messageJson
      if (typeof (result) !== 'undefined') {
        if (typeof (result.version_info) !== 'undefined') {
          variables.setVersions(result.version_info)
        }
        if (typeof (result.status) !== 'undefined') {
          const klipperstatus = result.status
          let currentProgress = 0
          if (typeof (klipperstatus.virtual_sdcard) !== 'undefined') {
            if (klipperstatus.virtual_sdcard.file_position <= variables.getStartByte()) {
              currentProgress = 0
              variables.setProgress(currentProgress)
            } else if (klipperstatus.virtual_sdcard.file_position >= variables.getEndByte()) {
              currentProgress = 100
              variables.setProgress(currentProgress)
            } else {
              const currentPosition = klipperstatus.virtual_sdcard.file_position - variables.getStartByte()
              const maxPosition = variables.getEndByte() - variables.getStartByte()
              if (currentPosition > 0 && maxPosition > 0) {
                currentProgress = (1 / maxPosition * currentPosition) * 100
              } else {
                currentProgress = klipperstatus.virtual_sdcard.progress
              }
            }
            if (variables.getStatus() === 'printing') {
              connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${  variables.getCurrentFile()  }"}, "id": ${  id  }}`)
              if (currentProgress.toFixed(0) !== 0 && currentProgress.toFixed(0) !== 100 && variables.getProgress() !== currentProgress.toFixed(0)) {
                  variables.setProgress(currentProgress.toFixed(0))
                  discordClient.user.setActivity(`Printing: ${  currentProgress.toFixed(0)  }%`, { type: 'WATCHING' })
                  console.log(currentProgress.toFixed(0) % config.statusupdateinterval === 0)
                  if (config.statusupdatepercent && currentProgress.toFixed(2) !== 0 && currentProgress % config.statusupdateinterval === 0) {
                      statusUtil.triggerStatusUpdate(discordClient)
                    }
                }
            }
          }
        }
      }
    }
}
module.exports = event
