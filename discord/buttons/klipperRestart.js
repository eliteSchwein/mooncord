const moonrakerClient = require('../../clients/moonrakerClient')

module.exports = async (button, discordClient) => {
    const message = button.message
    if (message.author.id !== discordClient.user.id) { return }
    if (button.id !== 'klipper_restart') { return }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "printer.firmware_restart", "id": ${id}}`)
}