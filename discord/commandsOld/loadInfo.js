const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')

const loadUtil = require('../../utils/loadUtil')
const locale = require('../../utils/localeUtil')
const variablesUtil = require('../../utils/variablesUtil')

const messageLocale = locale.commands.loadinfo
const syntaxLocale = locale.syntaxlocale.commands.loadinfo

module.exports = class LoadInfoCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Load Info Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                choices: generateChoices(),
                type: CommandOptionType.STRING,
                name: syntaxLocale.options.component.name,
                description: messageLocale.options.component.description,
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

        const component = ctx.options[syntaxLocale.options.component.name]

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
function generateMCUNoData(mcu, embed) {
    const description = locale.errors.no_data
        .replace(/(\${component})/g, `\`${mcu}\``)
    embed.setDescription(description)
    embed.setColor('#c90000')
    return embed

}
async function retrieveMCUComponent(mcu) {
    const template = loadUtil.getDefaultEmbed('mcu', mcu)
    const embed = template[1]

    const mcudata = variablesUtil.getMCUList()[mcu]

    if ( typeof(mcudata) === 'undefined' ) { return [template[0], generateMCUNoData(mcu, embed)] }
    if (JSON.stringify(mcudata) === '{}') { return [template[0], generateMCUNoData(mcu, embed)] }

    const mcuload = (mcudata.last_stats.mcu_task_avg + 3 * mcudata.last_stats.mcu_task_stddev) / 0.0025
    const mcuawake = mcudata.last_stats.mcu_awake / 5
    const mcufreq = mcudata.last_stats.freq / Number.parseInt('1000000')

    embed.addField(locale.loadinfo.mcu.chipset, mcudata.mcu_constants.MCU, true)
    embed.addField(locale.loadinfo.mcu.version, mcudata.mcu_version, true)
    embed.addField(locale.loadinfo.mcu.load, mcuload.toFixed(1), true)
    embed.addField(locale.loadinfo.mcu.awake, mcuawake.toFixed(1), true)
    embed.addField(locale.loadinfo.mcu.frequency, `${mcufreq.toFixed(1)} MHz`, true)

    return [template[0], embed]
}
function generateChoices() {
    const componentlist = loadUtil.getComponents()
    const mculist = variablesUtil.getMCUList()
    Object.keys(mculist).forEach(key => {
        componentlist.push({name: key.toUpperCase(), value: key})
    })
    return componentlist
}
