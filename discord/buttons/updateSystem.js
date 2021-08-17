const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

module.exports = async (button) => {
    const message = button.message
    const user = button.user

    if (message.author.id !== button.client.user.id) { return }
    if (button.customId !== 'update_system') { return }

    let guildID = button.guildId

    if (!await permission.hasAdmin(user, guildID, button.client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "machine.update.full", "id": ${id}}`)

    await button.update({components: []})
}