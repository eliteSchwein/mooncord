const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const components = require('../../utils/hsComponents')
const hsUtil = require('../../utils/hsUtil')
const variablesUtil = require('../../utils/variablesUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'loadinfo',
            description: 'Get the current Hardware and Software Informations.',
            options: [{
                choices: generateChoices(),
                type: CommandOptionType.STRING,
                name: 'component',
                description: 'Select the component you want to know the information about.',
                required: true
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            ctx.defer(false)

            const answer = await hsUtil.getInformation(ctx.options.component)

            await ctx.send({
                file: {
                    name: answer[0][0],
                    file: answer[0][1]
                },
                embeds: [answer[1].toJSON()]
            })
        }
        catch (error) {
            console.log(logSymbols.error, `Loadinfo Command: ${error}`.error)
            return 'An Error occured!'
        }
    }
    onUnload() {
        return 'okay'
    }
}
function generateChoices() {
    const componentlist = components.choices()
    const mculist = variablesUtil.getMCUList()
    Object.keys(mculist).forEach(key => {
        componentlist.push({name: key, value: key})
    })
    return componentlist
}