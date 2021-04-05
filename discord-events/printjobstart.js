const chatUtil = require('../utils/chatUtil')
const permission = require('../utils/permissionUtil')
const moonrakerClient = require('../clients/moonrakerclient')

const enableEvent = function (discordClient) {
    discordClient.on('messageReactionAdd', async (messageReaction, user) => {
        const { message } = messageReaction
        if (!chatUtil.hasMessageEmbed(message)) {
            return
        }
        if (user.id === discordClient.user.id) {
            return
        }
        const title = message.embeds[0].title
        if (title !== 'Start Print Job?') {
            return
        }
        messageReaction.users.remove(user)
        if (!await permission.hasAdmin(user, message.guild.id, discordClient)) {
            return
        }
        messageReaction.remove()
        if (messageReaction.emoji.name === '❌') {
            await message.reactions.removeAll()
            await message.edit(`Print Job request aborted, ${user.username}!`)
            return
        }
        
        if (messageReaction.emoji.name === '✅') {
            const gcodefile = message.embeds[0].author.anme
            const id = Math.floor(Math.random() * 10000) + 1
            await message.reactions.removeAll()
            await message.edit(`Print Job request executed, ${user.username}!`)
            moonrakerClient.getConnection().send(`{"jsonrpc": "2.0", "method": "printer.print.start", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
        }
    })
}
module.exports = enableEvent
