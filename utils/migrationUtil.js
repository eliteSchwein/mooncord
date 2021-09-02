const args = process.argv.slice(2)

const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

const config = require(`${args[0]}/mooncord.json`)

module.exports.migrate = async () => {
  let modified = false
  if (typeof (config.connection.moonraker_token) === 'undefined') {
    config.connection.moonraker_token = ""
    modified = true
  }
  if (typeof (config.timelapse.ffmpeg_arguments) === 'undefined') {
    config.timelapse.ffmpeg_arguments = [
      '-pix_fmt yuv420p',
      '-preset slower',
      '-crf 30'
    ]
    modified = true
  }
  if (typeof (config.timelapse.ffmpeg_codec) === 'undefined') {
    config.timelapse.ffmpeg_codec = 'libx264' 
    modified = true
  }
  if (modified) { await saveData() }
}

async function saveData() {
    await writeFile(path.resolve(`${args[0]}/mooncord.json`), JSON.stringify(config, null, 4), 'utf8')
    console.log(logSymbols.info, `The Config got updated!`.database)
}