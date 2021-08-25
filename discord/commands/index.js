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
    console.log('command: '+command)
    const messageLocale = locale.commands[command]
    const syntaxLocale = locale.syntaxlocale.commands[command]

    const builder = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    
    for(const index in commandOptions[command]) {
        buildCommandOption(builder, command, index)
    }
}

function buildCommandOption(builder, command, option) {
    const option = commandOptions[command][option]
    console.log(option)
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
    editchannel: require('./editChannel'),
    emergency_stop: require('./emergencyStop'),
    execute: require('./execute'),
    fileinfo: require('./fileInfo'),
    get_log: require('./getLog'),
    info: require('./info'),
    listfiles: require('./listFiles'),
    loadinfo: require('./loadInfo'),
    notify: require('./notify'),
    printjob: require('./printJob'),
    status: require('./status'),
    temp: require('./temp'),
    timelapse: require('./timelapse')
}