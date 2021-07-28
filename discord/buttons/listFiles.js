const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')
const chatUtil = require('../../utils/chatUtil')

const metaData = require('../buttons-metadata/list_files.json')

const commandlocale = locale.commands.listfiles

const requester = {}
const commandFeedback = {}

let connection

module.exports = async (button, discordClient) => {
    const message = button.message
    const user = button.clicker.user

    if (message.author.id !== discordClient.user.id) { return }
    if (!Object.keys(metaData).includes(button.id)) { return }

    const embed = message.embeds[0]

    if(embed.title !== commandlocale.embed.title) { return }

    connection = moonrakerClient.getConnection()

    const pageUp = metaData[button.id].page_up
    const page = chatUtil.retrieveCurrentPage(embed)

    await executeMessage(message, user, page, pageUp)
}

async function executeMessage(message, user, page, pageUp) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const {channel} = message

    let timeout = 0

    commandFeedback[message.channel.id] = undefined
    requester[channel.id] = user
    
    await message.edit(chatUtil.getWaitEmbed(user, commandlocale.embed.title, 'printlist.png'))

    connection.on('message', (message) => handler(message, channel, page, pageUp))
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

async function handler (message, channel, page, pageUp) {
    const messageJson = JSON.parse(message.utf8Data)
    connection.removeListener('message', handler)
    if (/(modified)/g.test(JSON.stringify(messageJson))) {
        commandFeedback[channel.id] = await chatUtil.generatePageEmbed(
            pageUp,
            page,
            messageJson.result,
            commandlocale.embed.title,
            'printlist.png',
            requester[channel.id])
    }
}