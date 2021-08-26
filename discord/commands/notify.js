const logSymbols = require('log-symbols')

const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.notify

module.exports.reply = async (interaction) => {
    try {
        const notifyStatus = database.updateNotify(interaction.user)
        if (notifyStatus) {
            await interaction.reply(messageLocale.answer.activated
                .replace(/(\${username})/g, interaction.user.username))
            return
        }
        await interaction.reply(messageLocale.answer.deactivated
            .replace(/(\${username})/g, interaction.user.username))
        return
    } catch (error) {
        console.log(logSymbols.error, `Notify Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}