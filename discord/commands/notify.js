const { SlashCommand } = require('slash-create');
const database = require('../../utils/databaseUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'notifyme',
            description: 'Should i DM you with the current print status?'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            const notifyStatus = database.updateNotify(ctx.user)
            if (notifyStatus) {
                return `I will notify you of the print status via DM, ${ctx.user.username}!`;
            }
            return `I will no longer notify you of the print status via DM, ${ctx.user.username}!`;
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}