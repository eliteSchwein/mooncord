const logSymbols = require('log-symbols')

const discordClient = require('../../clients/discordClient')
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
        if (!await permission.hasAdmin(ctx.user, ctx.guildID, discordClient.getClient)) {
            await interaction.reply(locale.getAdminOnlyError(ctx.user.username))
            return
        }

        console.log(interaction)
        
        connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    
        await interaction.deferReply()
    
        connection.send(`{"jsonrpc": "2.0", "method": "printer.emergency_stop", "id": ${id}}`)
            
        await interaction.reply(messageLocale.answer.executed
            .replace(/(\${username})/g, ctx.user.username))
    } catch (error) {
        console.log(logSymbols.error, `Emergency Stop Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}