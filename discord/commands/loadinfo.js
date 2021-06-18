const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const components = require('../../utils/hsComponents')
const loadUtil = require('../../utils/loadUtil')
const variablesUtil = require('../../utils/variablesUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.loadinfo

module.exports = class LoadInfoCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Load Info Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description,
            options: [{
                choices: generateChoices(),
                type: CommandOptionType.STRING,
                name: commandlocale.options.component.name,
                description: commandlocale.options.component.description,
                required: true
            }]
        })
        this.filePath = __filename
    }
    onUnload() {
        return 'okay'
    }

    async run(ctx) {
        ctx.defer(false)

        const component = ctx.options[commandlocale.options.component.name]

        let answer

        if (component.startsWith('mcu')) {
            answer = await retrieveMCUComponent(component)
        } else {
            answer = await loadUtil.getInformation(component)
        }

        await ctx.send({
            file: {
                name: answer[0][0],
                file: answer[0][1]
            },
            embeds: [answer[1].toJSON()]
        })
    }
    onError(error, ctx) {
        console.log(logSymbols.error, `Loadinfo Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }
}
async function retrieveMCUComponent(mcu) {
    const template = loadUtil.getDefaultEmbed('mcu', mcu)
    const embed = template[1]

    const mcudata = variablesUtil.getMCUList()[mcu]
    const mcuload = (mcudata.last_stats.mcu_task_avg + 3 * mcudata.last_stats.mcu_task_stddev) / 0.0025
    const mcuawake = mcudata.last_stats.mcu_awake / 5
    const mcufreq = mcudata.last_stats.freq / 1000000

    embed.addField(locale.loadinfo.mcu.chipset, mcudata.mcu_constants.MCU, true)
    embed.addField(locale.loadinfo.mcu.version, mcudata.mcu_version, true)
    embed.addField(locale.loadinfo.mcu.load, mcuload.toFixed(1), true)
    embed.addField(locale.loadinfo.mcu.awake, mcuawake.toFixed(1), true)
    embed.addField(locale.loadinfo.mcu.freq, `${mcufreq.toFixed(1)} MHz`, true)

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