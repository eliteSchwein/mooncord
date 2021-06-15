const moonrakerClient = require('../../clients/moonrakerclient')
const chatUtil = require('../../utils/chatUtil')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.listfiles

let connection
let pageUp
let page

const requester = {}

let commandFeedback = {}

let timeout = 0

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
        page = chatUtil.retrieveCurrentPage(message.embeds[0])
        connection = moonrakerClient.getConnection()

        if (messageReaction.emoji.name === '◀️') {
            pageUp = false
            await executeMessage(message, user)
            return
        }
        
        if (messageReaction.emoji.name === '▶️') {
            pageUp = true
            await executeMessage(message, user)
        }
    })
}

async function executeMessage(message, user) {
    const id = Math.floor(Math.random() * parseInt('10_000')) + 1
    const {channel} = message

    commandFeedback[message.channel.id] = undefined
    requester[channel.id] = user
    
    await message.edit(chatUtil.getWaitEmbed(user, 'printlist.png'))

    connection.on('message', (message) => handler(message, channel))
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback[message.channel.id]) !== 'undefined') {
            await message.edit(commandFeedback[message.channel.id])
            clearInterval(feedbackInterval)
        }
        if (timeout === 10) {
            await message.edit({
                content: locale.errors.no_files_found
            })
            commandFeedback = undefined
            connection.removeListener('message', handler)
            clearInterval(feedbackInterval)
        }
        timeout++
    }, 500)
}

async function handler (message, channel) {
    const messageJson = JSON.parse(message.utf8Data)
    connection.removeListener('message', handler)
    if (JSON.stringify(messageJson).match(/(modified)/g)) {
        commandFeedback[channel.id] = await chatUtil.generatePageEmbed(
            pageUp,
            page,
            messageJson.result,
            commandlocale.embed.title,
            'printlist.png',
            requester[channel.id])
    }
}
module.exports = enableEvent
