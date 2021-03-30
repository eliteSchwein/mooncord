const { SlashCommand, CommandOptionType } = require('slash-create');
const hsUtil = require('../utils/hsUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'hsinfo',
            description: 'Get the current Hardware and Software Informations.',
            options: [{
                choices: [
                    {
                        name: 'CPU',
                        value: 'cpu'
                    },
                    {
                        name: 'RAM',
                        value: 'ram'
                    },
                ],
                type: CommandOptionType.STRING,
                name: 'component',
                description: 'Select the component you want to know the information about.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        if (ctx.options.length === 0) {
            return "Please fill in the Command correctly!"
        }
        console.log(ctx.options.component)

        const answer = await hsUtil.getInformation(String(ctx.options.component).toUpperCase())

        console.log(answer)

        return "Soon TM";
    }
}