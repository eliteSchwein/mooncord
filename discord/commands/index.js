module.exports.addCommandEvents = (discordClient) => { commandEvent(discordClient) }
module.exports.loadSlashCommands = async (discordClient) => { await loadSlashCommands(discordClient) }

async function loadSlashCommands(discordClient) {
    const commandList = []
    for (let commandIndex in commands) {
        const command = commands[commandIndex]
        commandList.push(command.command())
    }
    await discordClient.application?.commands.set(commandList)
}

function commandEvent(discordClient) {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) { return }
        for (let commandIndex in commands) {
            const command = commands[commandIndex]
            if (command.command().name === interaction.commandName) {
                await command.reply(interaction)
                return
            }
        }
    })
}

const commands = {
    emergencyStop: require('./emergencyStop'),
    admin: require('./admin')
}