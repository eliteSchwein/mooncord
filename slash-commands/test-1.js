const { SlashCommand } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'test-1',
            description: 'Says hello to you.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        console.log(ctx)
        return `Hello, ${ctx.user.username}!`;
    }
}