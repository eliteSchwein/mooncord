const logSymbols = require('log-symbols')

const locale = require('../../utils/localeUtil')
const statusUtil = require('../../utils/statusUtil')

module.exports.reply = async (interaction) => {
    try {
        await interaction.deferReply()

        const status = await statusUtil.getManualStatusEmbed(interaction.user, interaction.client)

        await interaction.editReply(status)
    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.editReply(locale.errors.command_failed)
    }
}