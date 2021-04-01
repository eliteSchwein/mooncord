const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'test-2',
            description: 'Says hello to you.',
            options: [{
                type: CommandOptionType.SUB_COMMAND_GROUP,
                name: 'test1',
                description: 'Shows Informations about a Print File.',
                required: true,
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
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            
        }
        catch (err) {
            console.log(err)
            return "An Error occured!";
        }
        console.log(ctx)
        return `Hello, ${ctx.user.username}!`;
    }
}