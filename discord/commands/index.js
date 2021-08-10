const emergencyStop = require('./emergencyStop')


module.exports.addCommandEvents = (discordClient) => { commandEvent(discordClient) }
module.exports.loadSlashCommands = async (discordClient) => { await loadSlashCommands(discordClient) }

async function loadSlashCommands(discordClient) {
    const commands = []
    commands.push(emergencyStop.command())
    await discordClient.application?.commands.set(commands)
}

function commandEvent(discordClient) {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) { return }
        for (let command in commands()) {
            if (command.command === interaction.commandName) {
                await command.reply(interaction)
                return
            }
        }
    })
}

function commands() {
    return {
        emergencyStop
    }
}