module.exports.addCommandEvents = (discordClient) => { commandEvent(discordClient) }
module.exports.loadSlashCommands = async (discordClient) => { await loadSlashCommands(discordClient) }

async function loadSlashCommands(discordClient) {
    const commands = []
    for (let command in commands()) {
        commands.push(command.command())
    }
    await discordClient.application?.commands.set(commands)
}

function commandEvent(discordClient) {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) { return }
        for (let command in commands()) {
            console.log(command)
            if (command.command().name === interaction.commandName) {
                await command.reply(interaction)
                return
            }
        }
    })
}

function commands() {
    return {
        emergencyStop: require('./emergencyStop')
    }
}