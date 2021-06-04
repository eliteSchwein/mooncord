const { SlashCommand } = require('slash-create')

const database = require('../../utils/databaseUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'notifyme',
            description: 'Should i DM you with the current print status?'
        })
        this.filePath = __filename
    }

    run(ctx) {
        try {
            const notifyStatus = database.updateNotify(ctx.user)
            if (notifyStatus) {
                return `I will notify you of the print status via DM, ${ctx.user.username}!`
            }
            return `I will no longer notify you of the print status via DM, ${ctx.user.username}!`
        }
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
    }
}