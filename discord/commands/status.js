const { SlashCommand } = require('slash-create')
const logSymbols = require('log-symbols')

const statusUtil = require('../../utils/statusUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.status

module.exports = class StatusCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Status Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            ctx.defer(false)

            const status = await statusUtil.getManualStatusEmbed(ctx.user)

            const statusfiles = status.files

            const files = []

            for (const statusfileindex in statusfiles) {
                const statusfile = statusfiles[statusfileindex]
                files.push({
                    name: statusfile.name,
                    file: statusfile.attachment
                })
            }

            await ctx.send({
                file: files,
                embeds: [status.toJSON()]
            })
        }
        catch (error) {
            console.log(logSymbols.error, `Status Command: ${error}`.error)
            return locale.errors.command_failed
        }
    }
    async onUnload() {
        return 'okay'
    }
}