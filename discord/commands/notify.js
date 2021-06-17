const { SlashCommand } = require('slash-create')
const logSymbols = require('log-symbols')

const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.notify

module.exports = class NotifyCommand extends SlashCommand {
    constructor(creator) {
        console.log(logSymbols.info, 'Load Notify Command'.statusmessage)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description
        })
        this.filePath = __filename
    }

    run(ctx) {
        try {
            const notifyStatus = database.updateNotify(ctx.user)
            if (notifyStatus) {
                return commandlocale.answer.activated
                .replace(/(\${username})/g, ctx.user.username)
            }
            return commandlocale.answer.deactivated
            .replace(/(\${username})/g, ctx.user.username)
        }
        catch (error) {
            console.log(logSymbols.error, `Notify Command: ${error}`.error)
            return locale.errors.command_failed
        }
    }
    async onUnload() {
        return 'okay'
    }
}