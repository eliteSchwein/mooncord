const { SlashCommand, CommandOptionType } = require('slash-create');

const moonrakerClient = require('../clients/moonrakerclient')

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
            console.log(connection.on('message', handler))
            connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${gcode}"}, "id": ${id}}`)
            return 'wip'
        }
        catch (err) {
            console.log(err)
            return 'An Error occured!'
        }
    }
}

async function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  if (messageJson.method === 'notify_gcode_response') {
    let command = ''
    if (messageJson.params[0].includes('Unknown command')) {
      command = messageJson.params[0].replace('// Unknown command:', '').replaceAll('"', '')
      return 'Unknown Command'
    }
    if (messageJson.params[0].includes('Error')) {
      command = messageJson.params[0].replace('!! Error on ', '').replaceAll('\'', '')
      return `Syntax Error: ${command}`
    }
  }
}