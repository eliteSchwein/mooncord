const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerclient')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.execute

let commandFeedback
let connection

module.exports = class ExecuteCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Execute Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description,
            options: [{
                type: CommandOptionType.STRING,
                name: commandlocale.options.gcode.name,
                description: commandlocale.options.gcode.description,
                required: true
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
            return locale.errors.guild_only.replace(/(\${username})/g, ctx.user.username)
        }
        if (typeof (commandFeedback) !== 'undefined') {
            return locale.errors.not_ready.replace(/(\${username})/g, ctx.user.username)
        }
        
        const {gcode} = ctx.options
        const id = Math.floor(Math.random() * parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        let timeout = 0

        commandFeedback = undefined

        ctx.defer(false)

        const gcodeHandler = handler

        connection.on('message', gcodeHandler)
        connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${gcode}"}, "id": ${id}}`)
        const feedbackInterval = setInterval(() => {
            if (typeof (commandFeedback) !== 'undefined') {
                connection.removeListener('message', gcodeHandler)
                ctx.send({
                    content: commandFeedback
                })
                commandFeedback = undefined
                clearInterval(feedbackInterval)
            }
            if (timeout === 4) {
                commandFeedback = undefined
                ctx.send({
                    content: locale.errors.command_timeout
                })
                clearInterval(feedbackInterval)
                connection.removeListener('message', gcodeHandler)
            }
            timeout++
        }, 500)
    }
    onError(error, ctx) {
        console.log(logSymbols.error, `Execute Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        return locale.errors.command_failed
    }
    onUnload() {
        return 'okay'
    }
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
    if (messageJson.method === 'notify_gcode_response') {
        let command = ''
        if (messageJson.params[0].includes('Unknown command')) {
            command = messageJson.params[0].replace('// Unknown command:', '').replace(/"/g, '')
            commandFeedback = commandlocale.answer.unknown.replace(/(\${gcode_feedback})/g, command)
        } else if (messageJson.params[0].includes('Error')) {
            command = messageJson.params[0].replace('!! Error on ', '').replace(/\\/g, '')
            commandFeedback = commandlocale.answer.error.replace(/(\${gcode_feedback})/g, command)
        } else {
            commandFeedback = commandlocale.answer.success
        }
    }
}