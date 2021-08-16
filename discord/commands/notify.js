const logSymbols = require('log-symbols')
const { SlashCommandBuilder } = require('@discordjs/builders')

const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.notify
const syntaxLocale = locale.syntaxlocale.commands.notify

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        const notifyStatus = database.updateNotify(ctx.user)
        if (notifyStatus) {
            await interaction.reply(messageLocale.answer.activated
                .replace(/(\${username})/g, ctx.user.username))
            return
        }
        await interaction.reply(messageLocale.answer.deactivated
            .replace(/(\${username})/g, ctx.user.username))
        return
    } catch (error) {
        console.log(logSymbols.error, `Notify Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}