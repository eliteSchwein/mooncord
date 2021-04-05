const chatUtil = require('../utils/chatUtil')
const permission = require('../utils/permissionUtil')
const moonrakerClient = require('../clients/moonrakerclient')

let connection
let pageUp
let page

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
        const title = message.embeds[0].title
        if (title !== 'Print Files') {
            return
        }
        messageReaction.users.remove(user)
        if (!await permission.hasAdmin(user, message.guild.id, discordClient)) {
            return
        }
        messageReaction.remove()
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
            return
        }
    })
}

async function executeMessage(message, user) {
    const id = Math.floor(Math.random() * 10000) + 1

    commandFeedback = undefined
    await message.edit(chatUtil.getWaitEmbed(user))

    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback) !== 'undefined') {
            if (commandFeedback === 'Not Found!') {
                await message.reactions.removeAll()
                await message.suppressEmbeds(true)
                await message.edit('There are currently no Files!')
            } else {
                await message.edit(commandFeedback)
            }
            clearInterval(feedbackInterval)
        }
        if (timeout === 4) {
            await message.reactions.removeAll()
            await message.suppressEmbeds(true)
            await message.edit('Command execution failed!')
            connection.removeListener('message', handler)
            clearInterval(feedbackInterval)
        }
        timeout++
    }, 500)
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (messageJson.result.length === 0) {
        commandFeedback = `Not Found!`
        connection.removeListener('message', handler)
        return
    }
    commandFeedback = await chatUtil.generatePageEmbed(pageUp, page, messageJson.result, 'Print Files', 'printlist.png')
    connection.removeListener('message', handler)
    return
}
module.exports = enableEvent
