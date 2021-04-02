const { SlashCommand } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'test-1',
            description: 'Says hello to you.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            console.log(ctx.options)
            return `Hello, ${ctx.user.username}!`;
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}