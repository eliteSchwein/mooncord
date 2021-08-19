const { SlashCommandBuilder } = require('@discordjs/builders')
const logSymbols = require('log-symbols')

const messageLocale = locale.commands.emergency_stop
const syntaxLocale = locale.syntaxlocale.commands.emergency_stop

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {

    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}