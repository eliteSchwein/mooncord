const { SlashCommand, CommandOptionType } = require('slash-create');
const si = require('systeminformation')

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
                description: 'test',
                //description: 'Select the component you want to know the information about.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {

        ctx.defer(false)

        return "Soon TM";
    }
}