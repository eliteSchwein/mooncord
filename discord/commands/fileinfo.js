const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')

const moonrakerClient = require('../../clients/moonrakerclient')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.fileinfo
const syntaxLocale = locale.syntaxlocale.commands.fileinfo

let commandFeedback
let connection

let lastid = 0

module.exports = class FileInfoCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load File Info Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                type: CommandOptionType.STRING,
                name: syntaxLocale.options.file.name,
                description: messageLocale.options.file.description,
                required: true
            }]
        })
        this.filePath = __filename
    }

    run(ctx) {
        if (typeof (commandFeedback) !== 'undefined') {
            return locale.getCommandNotReadyError(ctx.user.username)
        }
        let gcodefile = ctx.options[syntaxLocale.options.file.name]
        if (!gcodefile.endsWith('.gcode')) {
            gcodefile += '.gcode'
        }

        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        let timeout = 0

        commandFeedback = undefined

        ctx.defer(false)

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
        const feedbackInterval = setInterval(() => {
            if (typeof (commandFeedback) !== 'undefined') {
                if( lastid === id ) { return }
                lastid = id
                if (commandFeedback === 'Not Found!') {
                    commandFeedback = undefined
                    ctx.send({
                        content: locale.errors.file_not_found
                    })
                } else {
                    if (commandFeedback.files.length > 0) {
                        const thumbnail = commandFeedback.files[0]
                        const files = {
                            name: thumbnail.name,
                            file: thumbnail.attachment
                        }
                        ctx.send({
                            file: files,
                            embeds: [commandFeedback.toJSON()]
                        })
                    } else {
                        ctx.send({
                            embeds: [commandFeedback.toJSON()]
                        })
                    }
                    commandFeedback = undefined
                }
                lastid = 0
                clearInterval(feedbackInterval)
            }
            if (timeout === 4) {
                ctx.send({
                    content: locale.errors.command_timeout
                })
                commandFeedback = undefined
                clearInterval(feedbackInterval)
                connection.removeListener('message', handler)
            }
            timeout++
        }, 500)
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Fileinfo Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
        connection.removeListener('message', handler)
        commandFeedback = undefined
    }

    onUnload() {
        return 'okay'
    }
}

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, locale.fileinfo.title, '#0099ff')
    connection.removeListener('message', handler)
}