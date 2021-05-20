const { SlashCommand, CommandOptionType } = require('slash-create');

const moonrakerClient = require('../../clients/moonrakerclient')
const handlers = require('../../utils/handlerUtil')

let commandFeedback
let connection

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'fileinfo',
            description: 'Execute a GCode Command',
            options: [{
                type: CommandOptionType.STRING,
                name: 'file',
                description: 'Shows Informations about a Print File.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    run(ctx) {
        try {
            if (typeof (commandFeedback) !== 'undefined') {
                return `This Command is not ready, ${ctx.user.username}!`
            }
            let gcodefile = ctx.options.file
            if (!gcodefile.endsWith('.gcode')) {
                gcodefile += '.gcode'
            }

            const id = Math.floor(Math.random() * parseInt('10_000')) + 1
            connection = moonrakerClient.getConnection()

            let timeout = 0

            commandFeedback = undefined

            ctx.defer(false)

            connection.on('message', handler)
            connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
            const feedbackInterval = setInterval(() => {
                if (typeof (commandFeedback) !== 'undefined') {
                    if (commandFeedback === 'Not Found!') {
                        commandFeedback = undefined
                        ctx.send({
                            content: 'File not Found!'
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
                            });
                        } else {
                            ctx.send({
                                embeds: [commandFeedback.toJSON()]
                            });
                        }
                        commandFeedback = undefined
                    }
                    clearInterval(feedbackInterval)
                }
                if (timeout === 4) {
                    ctx.send({
                        content: 'Command execution failed!'
                    })
                    commandFeedback = undefined
                    clearInterval(feedbackInterval)
                    connection.removeListener('message', handler)
                }
                timeout++
           }, 500)
        }
        catch (error) {
            console.log((error).error)
            commandFeedback = undefined
            connection.removeListener('message', handler)
            return 'An Error occured!'
        }
    }
}

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, 'File Informations', '#0099ff')
    connection.removeListener('message', handler)
}