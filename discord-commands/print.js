const { SlashCommand, CommandOptionType } = require('slash-create');

const permission = require('../utils/permissionUtil')
const variables = require('../utils/variablesUtil')
const moonrakerClient = require('../clients/moonrakerclient')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'print',
            description: 'Control or start a Print Job.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'pause',
                description: 'Pause Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'cancel',
                description: 'Cancel Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'resume',
                description: 'Resume Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'start',
                description: 'Start new Print Job',
                options: [{
                    type: CommandOptionType.STRING,
                    name: 'file',
                    description: 'Select a Print File.',
                    required: true
                }]
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }
            const subcommand = ctx.subcommands[0]
            const id = Math.floor(Math.random() * 10000) + 1
            if (subcommand === 'resume') {
                if (variables.getStatus() !== 'pause') {
                    return `${ctx.user.username} the Printer isn\`t currently Pausing!`
                }
                moonrakerClient.getConnection().send(`{"jsonrpc": "2.0", "method": "printer.print.resume", "id": ${id}}`)
                return `${ctx.user.username} you resumed the Print!`
            }
            if (subcommand === 'cancel') {
                if (variables.getStatus() !== 'printing' && variables.getStatus() !== 'pause') {
                    return `${ctx.user.username} the Printer doesn\`t have a Print Job!`
                }
                moonrakerClient.getConnection().send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "CANCEL_PRINT"}, "id": ${id}}`)
                return `${ctx.user.username} you canceled the Print!`
            }
            if (subcommand === 'pause') {
                if (variables.getStatus() !== 'printing') {
                    return `${ctx.user.username} the Printer isn\`t currently Printing!`
                }
                moonrakerClient.getConnection().send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "PAUSE"}, "id": ${id}}`)
                return `${ctx.user.username} you paused the Print!`
            }
            if (subcommand === 'start') {
                const file = ctx.options[subcommand].file
                return file
            }
            console.log(ctx)
            return "An Error occured!"
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}