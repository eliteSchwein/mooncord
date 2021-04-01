const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'admin',
            description: 'Add or Remove a Admin User or Role.',
            options: [{
                type: CommandOptionType.STRING,
                name: 'test1',
                description: 'Shows Informations about a Print File.',
                required: true
            },{
                type: CommandOptionType.STRING,
                name: 'test2',
                description: 'Shows Informations about a Print File.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        console.log(ctx)
        return `Hello, ${ctx.user.username}!`;
    }
}