const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metadata = require('../commands-metadata/get_log.json')

const messageLocale = locale.commands.get_log
const syntaxLocale = locale.syntaxlocale.commands.get_log

module.exports = class EditChannelCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Get Log Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                choices: metadata.choices,
                type: CommandOptionType.STRING,
                name: syntaxLocale.options.log_file.name,
                description: messageLocale.options.log_file.description,
                required: false
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (!await permission.hasCotnroller(ctx.user, ctx.guildID, discordClient.getClient())) {
            return locale.getControllerOnlyError(ctx.user.username)
        }

        ctx.defer(false)
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Get Log  Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }

    onUnload() {
        return 'okay'
    }
}
