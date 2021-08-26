const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.execute
const syntaxLocale = locale.syntaxlocale.commands.execute

let commandFeedback
let connection

let lastid = 0

module.exports.reply = async (interaction) => {
    try {
        if (!await permission.hasAdmin(interaction.user, interaction.guildId, interaction.client)) {
            await interaction.reply(locale.getAdminOnlyError(interaction.user.username))
            return
        }
        if (typeof (commandFeedback) !== 'undefined') {
            await interaction.reply(locale.getCommandNotReadyError(interaction.user.username))
            return
        }

        const gcode = interaction.options.getString(syntaxLocale.options.gcode.name)
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        let timeout = 0

        commandFeedback = undefined

        await interaction.deferReply()

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${gcode}"}, "id": ${id}}`)

        const feedbackInterval = setInterval(async () => {
            if (typeof (commandFeedback) !== 'undefined') {
                if( lastid === id ) { return }
                lastid = id
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
                await interaction.editReply(
                    commandFeedback)
                commandFeedback = undefined
                lastid = 0
            }
            if (timeout === 4) {
                commandFeedback = undefined
                clearInterval(feedbackInterval)
                connection.removeListener('message', handler)
                await interaction.editReply(
                    locale.errors.command_timeout)
            }
            timeout++
        }, 500)
    } catch (error) {
        console.log(logSymbols.error, `Execute Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        await interaction.editReply(locale.errors.command_failed)
    }
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
    if (messageJson.method === 'notify_gcode_response') {
        let command = ''
        if (messageJson.params[0].includes('Unknown command')) {
            command = messageJson.params[0].replace('// Unknown command:', '').replace(/"/g, '')
            commandFeedback = messageLocale.answer.unknown.replace(/(\${gcode_feedback})/g, command)
        } else if (messageJson.params[0].includes('Error')) {
            command = messageJson.params[0].replace('!! Error on ', '').replace(/\\/g, '')
            commandFeedback = messageLocale.answer.error.replace(/(\${gcode_feedback})/g, command)
        } else {
            commandFeedback = messageLocale.answer.success
        }
    }
}