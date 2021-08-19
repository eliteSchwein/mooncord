const { SlashCommandBuilder } = require('@discordjs/builders')
const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerClient')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.fileinfo
const syntaxLocale = locale.syntaxlocale.commands.fileinfo

let commandFeedback
let connection

let lastid = 0

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
        .addStringOption(file => 
            file.setName(syntaxLocale.options.file.name)
            .setDescription(messageLocale.options.file.description)
            .setRequired(true))
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (typeof (commandFeedback) !== 'undefined') {
            await interaction.reply(locale.getCommandNotReadyError(interaction.user.username))
            return
        }
        let gcodefile = interaction.options.getString(syntaxLocale.options.file.name)
        if (!gcodefile.endsWith('.gcode')) {
            gcodefile += '.gcode'
        }

        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        let timeout = 0

        commandFeedback = undefined

        await interaction.deferReply()

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
        const feedbackInterval = setInterval(async () => {
            if (typeof (commandFeedback) !== 'undefined') {
                if( lastid === id ) { return }
                lastid = id
                if (commandFeedback === 'Not Found!') {
                    await interaction.editReply({
                        content: locale.errors.file_not_found
                    })
                } else {
                    await interaction.editReply(commandFeedback)
                }
                lastid = 0
                commandFeedback = undefined
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
            }
            if (timeout === 4) {
                await interaction.editReply({
                    content: locale.errors.command_timeout
                })
                commandFeedback = undefined
                clearInterval(feedbackInterval)
                connection.removeListener('message', handler)
            }
            timeout++
        }, 500)
    } catch (error) {
        console.log(logSymbols.error, `Fileinfo Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        await interaction.editReply(locale.errors.command_failed)
    }
}

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, locale.fileinfo.title, '#0099ff')
    connection.removeListener('message', handler)
}