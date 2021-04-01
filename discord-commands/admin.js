const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'admin',
            description: 'Says hello to you.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'role',
                description: 'Modify Role',
                options: [{
                    type: CommandOptionType.ROLE,
                    name: 'role',
                    description: 'Select a Role.',
                    required: true
                }]
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'user',
                description: 'Modify User',
                options: [{
                    type: CommandOptionType.USER,
                    name: 'user',
                    description: 'Select a User.',
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