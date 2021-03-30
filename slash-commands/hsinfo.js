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
        if (ctx.options.length === 0) {
            return "Please fill in the Command correctly!"
        }
        console.log(ctx.options.component)

        return "Soon TM";
    }
}