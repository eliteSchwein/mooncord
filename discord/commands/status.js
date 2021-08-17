const logSymbols = require('log-symbols')
const { SlashCommandBuilder } = require('@discordjs/builders')

const locale = require('../../utils/localeUtil')
const statusUtil = require('../../utils/statusUtil')

const messageLocale = locale.commands.status
const syntaxLocale = locale.syntaxlocale.commands.status

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        await interaction.deferReply()

        const status = await statusUtil.getManualStatusEmbed(interaction.user)

        await interaction.editReply(status)
    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.editReply(locale.errors.command_failed)
    }
}