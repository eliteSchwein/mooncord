const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.emergency_stop
const syntaxLocale = locale.syntaxlocale.commands.emergency_stop

let connection

module.exports.command = () => {
    return {
        name: syntaxLocale.command,
        description: messageLocale.description
    }
}

module.exports.reply = async (interaction) => {
    try {
        if (!await permission.hasAdmin(interaction.user, interaction.guildId, interaction.client)) {
            await interaction.reply(locale.getAdminOnlyError(interaction.user.username))
            return
        }
        
        connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    
        await interaction.deferReply()
    
        connection.send(`{"jsonrpc": "2.0", "method": "printer.emergency_stop", "id": ${id}}`)
            
        await interaction.editReply(messageLocale.answer.executed
            .replace(/(\${username})/g, interaction.user.username))
    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}