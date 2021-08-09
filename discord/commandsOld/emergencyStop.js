const logSymbols = require('log-symbols')
const { SlashCommand } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.emergency_stop
const syntaxLocale = locale.syntaxlocale.commands.emergency_stop

let connection

module.exports = class EmergencyStopCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Emergency Stop Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (!await permission.hasAdmin(ctx.user, ctx.guildID, discordClient.getClient)) {
            return locale.getAdminOnlyError(ctx.user.username)
        }
        
        connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

        ctx.defer(false)

        connection.send(`{"jsonrpc": "2.0", "method": "printer.emergency_stop", "id": ${id}}`)
        
        return messageLocale.answer.executed
            .replace(/(\${username})/g, ctx.user.username)
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }

    onUnload() {
        return 'okay'
    }
}
