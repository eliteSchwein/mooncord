const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerclient')
const permission = require('../../utils/permissionUtil')

let commandFeedback
let connection

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'execute',
            description: 'Execute a GCode Command',
            options: [{
                type: CommandOptionType.STRING,
                name: 'gcode',
                description: 'GCode that you want to execute.',
                required: true
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }
            if (typeof (commandFeedback) !== 'undefined') {
                return `This Command is not ready, ${ctx.user.username}!`
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
                        content: 'Command execution failed!'
                    })
                    clearInterval(feedbackInterval)
                    connection.removeListener('message', gcodeHandler)
                }
                timeout++
           }, 500)
        }
        catch (error) {
            console.log(logSymbols.error, `Execute Command: ${error}`.error)
            connection.removeListener('message', handler)
            commandFeedback = undefined
            return "An Error occured!"
        }
    }
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
    if (messageJson.method === 'notify_gcode_response') {
        let command = ''
        if (messageJson.params[0].includes('Unknown command')) {
            command = messageJson.params[0].replace('// Unknown command:', '').replace(/"/g, '')
            commandFeedback = `Unknown GCode Command: \`${command}\``
        } else if (messageJson.params[0].includes('Error')) {
            command = messageJson.params[0].replace('!! Error on ', '').replace(/\\/g, '')
            commandFeedback = `Error: \`${command}\``
        } else {
            commandFeedback = 'Command Executed!'
        }
    }
}