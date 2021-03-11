const admin = false
const master = false
const variables = require('../utils/variablesUtil')

const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  let alltemps = ''
  const temps = variables.getTemps()
  for (const temp in temps) {
    if (temp.includes('temperature_sensor')) {
      alltemps = alltemps.concat(`**🌡${temp.replace('temperature_sensor ', '')}:**\n\`${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\`\n\n`)
    } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
      alltemps = alltemps.concat(`**♨${temp.replace('heater_generic ', '')}:**\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Power:${calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])}%\`\n\n`)
    } else if (temp.includes('temperature_fan')) {
      alltemps = alltemps.concat(`**❄${temp}**:\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Speed:${calculatePercent(temps[temp].speeds[temps[temp].speeds.length - 1])}\`\n\n`)
    }
  }
  channel.send(alltemps)
}
function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
