const { SlashCommand } = require('slash-create');
const core = require('../mooncord')
const statusUtil = require('../utils/statusUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'status',
            description: 'Get the current Print Status'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            ctx.defer(false)

            const status = await statusUtil.getManualStatusEmbed(core.getDiscordClient(), ctx.user)

            const statusfiles = status.files

            let files = []

            for (let statusfileindex in statusfiles) {
                let statusfile = statusfiles[statusfileindex]
                files.push({
                    name: statusfile.name,
                    file: statusfile.attachment
                })
            }

            await ctx.send({
                file: files,
                embeds: [status.toJSON()]
            });
        }
        catch (err) {
            console.log(err)
            return "An Error occured!"
        }
    }
}