const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'admin',
            description: 'Says hello to you.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'subcommandtest',
                description: 'test of test',
                options: [{
                    type: CommandOptionType.ROLE,
                    name: 'role',
                    description: 'Shows Informations about a Print File.',
                    required: true
                },{
                    type: CommandOptionType.USER,
                    name: 'user',
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