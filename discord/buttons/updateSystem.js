const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

module.exports = async (button) => {
    const {message, user, customId, guildId, client} = button

    if (customId !== 'update_system') { return }

    if (!await permission.hasAdmin(user, guildId, client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.full", "id": ${id}}`)
    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)

    await button.update({components: []})
}