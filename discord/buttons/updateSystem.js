const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

module.exports = async (button, discordClient) => {
    const message = button.message
    const user = button.clicker.user

    if (message.author.id !== discordClient.user.id) { return }
    if (button.id !== 'update_system') { return }

    if (!await permission.hasAdmin(user, guildID, discordClient)) {
        button.reply.send(message.channel.send(locale.getAdminOnlyError(user.username)))
    }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.full", "id": ${id}}`)
}