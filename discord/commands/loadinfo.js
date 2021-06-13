const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const components = require('../../utils/hsComponents')
const loadUtil = require('../../utils/loadUtil')
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
    async onUnload() {
        return 'okay'
    }

    async run(ctx) {
        try {
            ctx.defer(false)

            const component = ctx.options.component

            let answer

            if (component.startsWith('mcu')) {
                answer = await retrieveMCUComponent(component)
            } else {
                answer = await loadUtil.getInformation(ctx.options.component)
            }

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
}
async function retrieveMCUComponent(mcu) {
    const template = loadUtil.getDefaultEmbed('mcu', mcu)
    const embed = template[1]

    const mcudata = variablesUtil.getMCUList()[mcu]
    const mcuload = (mcudata.last_stats.mcu_task_avg + 3 * mcudata.last_stats.mcu_task_stddev) / 0.0025
    const mcufreq = (mcudata.last_stats.freq / parseInt('1_000_000'))

    embed.addField('Chipset', mcudata.mcu_constants.MCU, true)
    embed.addField('Version', mcudata.mcu_version, true)
    embed.addField('Load', mcuload.toFixed(1), true)
    embed.addField('Freq', mcufreq.toFixed(1), true)

    return [template[0], embed]
}
function generateChoices() {
    const componentlist = components.choices()
    const mculist = variablesUtil.getMCUList()
    Object.keys(mculist).forEach(key => {
        componentlist.push({name: key.toUpperCase(), value: key})
    })
    return componentlist
}