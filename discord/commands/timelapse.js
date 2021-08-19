const args = process.argv.slice(2)

const { SlashCommandBuilder } = require('@discordjs/builders')
const logSymbols = require('log-symbols')

const locale = require('../../utils/localeUtil')
const timelapseUtil = require('../../utils/timelapseUtil')
const variablesUtil = require('../../utils/variablesUtil')

const messageLocale = locale.dynamic_commands.timelapse
const syntaxLocale = locale.syntaxlocale.dynamic_commands.timelapse

const config = require(`${args[0]}/mooncord.json`)

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (!config.timelapse.enable) {
            await interaction.reply(locale.errors.command_disabled)
            return
        }

        if (variablesUtil.getLastPrintJob() === '') {
            await interaction.reply(locale.errors.no_timelapse)
            return
        }

        await interaction.deferReply()

        const timelapseEmbed = timelapseUtil.getEmbed()

        await interaction.editReply(timelapseEmbed)

    } catch (error) {
        console.log(logSymbols.error, `Timelapse Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}