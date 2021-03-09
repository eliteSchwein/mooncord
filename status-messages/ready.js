const pjson = require('../package.json')
const variables = require('../utils/variablesUtil')
const statusUtil = require('../utils/statusUtil')
const webcamUtil = require('../utils/webcamUtil')

const getModule = async function (discordClient, channel, user) {
  discordClient.user.setActivity('for GCODE File...', { type: 'LISTENING' })

  const snapshot = await webcamUtil.retrieveWebcam()
  const versions = variables.getVersions()
  const {moonraker} = versions
  const {klipper} = versions
  let moonrakerver = moonraker.version
  let klipperver = klipper.version
  if (moonrakerver !== moonraker.remote_version) {
    moonrakerver = moonrakerver.concat(` **(${  moonraker.remote_version  })**`)
  }
  if (klipperver !== klipper.remote_version) {
    klipperver = klipperver.concat(` **(${  klipper.remote_version  })**`)
  }

  const statusEmbed = statusUtil.getDefaultEmbed(user,'Printer Ready','#0099ff')
  statusEmbed
    .addField('Mooncord Version', pjson.version, true)
    .addField('Moonraker Version', moonrakerver, true)
    .addField('Klipper Version', klipperver, true)
    .attachFiles(snapshot)
    .setImage(`attachment://${  snapshot.name}`)

  statusUtil.postStatus(discordClient,statusEmbed,channel)
}

module.exports = getModule
