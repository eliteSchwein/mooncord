const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'test-2',
            description: 'Says hello to you.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'test3',
                description: 'Shows Informations about a Print File.',
                required: true,
                options: [{
                    type: CommandOptionType.STRING,
                    name: 'test1',
                    description: 'Shows Informations about a Print File.'
                },{
                    type: CommandOptionType.STRING,
                    name: 'test2',
                    description: 'Shows Informations about a Print File.'
                }]
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        console.log(ctx)
        return `Hello, ${ctx.user.username}!`;
    }
}