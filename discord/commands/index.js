const { SlashCommandBuilder } = require('@discordjs/builders')

const locale = require('../../utils/localeUtil')

const commandOptions = require('../commands-metadata/commands_options.json')

module.exports.addCommandEvents = (discordClient) => { commandEvent(discordClient) }
module.exports.loadSlashCommands = async (discordClient) => { await loadSlashCommands(discordClient) }

async function loadSlashCommands(discordClient) {
    const commandList = []
    for (const commandIndex in commands) {
        buildSlashCommand(commandIndex)
        const command = commands[commandIndex]
        commandList.push(command.command())
    }
    await discordClient.application?.commands.set(commandList)
}

function buildSlashCommand(command) {
    console.log(command)
    const messageLocale = locale.commands[command]
    const syntaxLocale = locale.syntaxlocale.commands[command]

    const builder = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    
    for(const index in commandOptions[command]) {
        console.log(index)
    }
}

function buildCommandOption(builder, command, option) {

}

function convertChoices(choices) {
    const answer = []
    for (const index in Object.keys(choices)) {
        const value = choices[index]
        answer.push([value.name, value.value])
    }
    return answer
}

function commandEvent(discordClient) {
    discordClient.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) { return }
        for (const commandIndex in commands) {
            const command = commands[commandIndex]
            if (command.command().name === interaction.commandName) {
                await command.reply(interaction)
                return
            }
        }
    })
}

const commands = {
    admin: require('./admin'),
    editChannel: require('./editChannel'),
    emergencyStop: require('./emergencyStop'),
    execute: require('./execute'),
    fileInfo: require('./fileInfo'),
    getLog: require('./getLog'),
    info: require('./info'),
    listFiles: require('./listFiles'),
    loadInfo: require('./loadInfo'),
    notify: require('./notify'),
    printJob: require('./printJob'),
    status: require('./status'),
    temp: require('./temp'),
    timelapse: require('./timelapse')
}