const { SlashCommand, CommandOptionType } = require('slash-create');

const moonrakerClient = require('../clients/moonrakerclient')

let commandFeedback

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'execute',
            description: 'Execute a GCode Command',
            options: [{
                type: CommandOptionType.STRING,
                name: 'gcode',
                description: 'GCode that you want to execute.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            const gcode = ctx.options.gcode
            const id = Math.floor(Math.random() * 10000) + 1
            const connection = moonrakerClient.getConnection()
            commandFeedback = undefined

            ctx.defer(false)

            const gcodeHandler = handler

            connection.on('message', gcodeHandler)
            connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${gcode}"}, "id": ${id}}`)
            const feedbackInterval = setInterval(() => {
                if (typeof (commandFeedback) !== 'undefined') {
                    console.log(commandFeedback)
                    //connection.removeListener(gcodeHandler)
                    ctx.send({
                        content: commandFeedback
                    })
                    clearInterval(feedbackInterval)
                }
           }, 500)
        }
        catch (err) {
            console.log(err)
            return 'An Error occured!'
        }
    }
}

function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  if (messageJson.method === 'notify_gcode_response') {
    let command = ''
    if (messageJson.params[0].includes('Unknown command')) {
        commandFeedback = 'Unknown Command'
        return
    }
    if (messageJson.params[0].includes('Error')) {
        command = messageJson.params[0].replace('!! Error on ', '').replaceAll('\'', '')
        commandFeedback = `Syntax Error: ${command}`
        return
      }
      commandFeedback = 'Command Executed!'
      return
  }
}