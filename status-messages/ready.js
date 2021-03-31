const pjson = require('../package.json')
const { status, variables } = require('../utils')
const { discordClient } = require('../clients')

const getModule = async function (user) {
  discordClient.user.setActivity('for GCODE File...', { type: 'LISTENING' })

  const versions = variables.getVersions()
  const { moonraker } = versions
  const { klipper } = versions
  let moonrakerver = moonraker.version
  let klipperver = klipper.version
  if (moonrakerver !== moonraker.remote_version) {
    moonrakerver = moonrakerver.concat(` **(${moonraker.remote_version})**`)
  }
  if (klipperver !== klipper.remote_version) {
    klipperver = klipperver.concat(` **(${klipper.remote_version})**`)
  }

  const statusEmbed = status.getDefaultEmbed(user, 'Printer Ready', '#0099ff')
  statusEmbed
    .addField('Mooncord Version', pjson.version, true)
    .addField('Moonraker Version', moonrakerver, true)
    .addField('Klipper Version', klipperver, true)
  
  return statusEmbed
}

module.exports = getModule
