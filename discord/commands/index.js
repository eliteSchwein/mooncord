const emergencyStop = require('./emergencyStop')

module.exports.addCommandEvents = (discordClient) => { }
module.exports.loadSlashCommands = async (discordClient) => { await loadSlashCommands(discordClient) }

async function loadSlashCommands(discordClient) {
    const commands = []
    commands.push(emergencyStop.command)
    console.log(commands)
    const status = await discordClient.application?.commands.set(commands)
    console.log(status)
}