const messageLocale = locale.commands.emergency_stop
const syntaxLocale = locale.syntaxlocale.commands.emergency_stop

module.exports.command = () => {
    return {
        name: syntaxLocale.command,
        description: messageLocale.description
    }
}

module.exports.reply = async (interaction) => {
    try {
        
    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}