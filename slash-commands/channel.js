const { SlashCommand, CommandOptionType } = require('slash-create');
const permissionUtil = require('../utils/permissionUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'channel',
            description: 'Add or Remove broadcast channel.',
            options: [{
                type: CommandOptionType.CHANNEL,
                name: 'Channel',
                description: 'Select a Channel to add/remove it as Broadcast channel.',
                required: false
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        if (!permissionUtil.hasAdmin(ctx.user, ctx.guildID)) {
            return `You dont have the Permissions, ${ctx.user.username}!`
        }
        console.log(ctx)
        return `Hello, ${ctx.user.username}!`;
    }
}