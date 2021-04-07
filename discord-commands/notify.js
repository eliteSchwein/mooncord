const { SlashCommand } = require('slash-create');
const database = require('../utils/databaseUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'notifyme',
            description: 'Should i DM you with the current Print Job Status?'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            const notifyStatus = database.updateNotify(ctx.user)
            if (notifyStatus) {
                return `I will notify the Print Job Status via DM, ${ctx.user.username}!`;
            }
            return `I will not longer notify the Print Job Status via DM, ${ctx.user.username}!`;
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}