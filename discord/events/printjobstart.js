const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const commandlocale = locale.commands.printjob

const enableEvent = function (discordClient) {
    discordClient.on('messageReactionAdd', async (messageReaction, user) => {
        const { message } = messageReaction
        if (!chatUtil.hasMessageEmbed(message)) {
            return
        }
        if (user.id === discordClient.user.id) {
            return
        }
        const {title} = message.embeds[0]
        if (title !== commandlocale.embed.title) {
            return
        }
        if (message.channel.type === 'text') {
            await messageReaction.users.remove(user)
        }
        if (!await permission.hasAdmin(user, message.guild, discordClient)) {
            return
        }
        if (messageReaction.emoji.name === '❌') {
            if (message.channel.type === 'text') {
                await message.reactions.removeAll()
            }
            await message.edit(commandlocale.answer.abort.replace(/(\${username})/g, user.username))
            await message.suppressEmbeds(true)
            return
        }
        
        if (messageReaction.emoji.name === '✅') {
            const gcodefile = message.embeds[0].author.name
            const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

            if (message.channel.type === 'text') {
                await message.reactions.removeAll()
                
            }
            await message.edit(commandlocale.answer.executed.replace(/(\${username})/g, user.username))
            await message.suppressEmbeds(true)

            moonrakerClient.getConnection().send(`{"jsonrpc": "2.0", "method": "printer.print.start", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
        }
    })
}
module.exports = enableEvent
