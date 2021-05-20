const { SlashCommand } = require('slash-create');

const statusUtil = require('../../utils/statusUtil')

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

            const status = await statusUtil.getManualStatusEmbed(ctx.user)

            const statusfiles = status.files

            const files = []

            for (const statusfileindex in statusfiles) {
                const statusfile = statusfiles[statusfileindex]
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
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
    }
}