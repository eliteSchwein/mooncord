const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')
const chatUtil = require('../../utils/chatUtil')

const metaData = require('../buttons-metadata/list_files.json')

const commandlocale = locale.commands.listfiles

const requester = {}
const commandFeedback = {}

let connection

module.exports = async (button) => {
    const message = button.message
    const user = button.user

    if (message.author.id !== button.client.user.id) { return }
    if (!Object.keys(metaData).includes(button.customId)) { return }

    const embed = message.embeds[0]

    if(embed.title !== commandlocale.embed.title) { return }

    connection = moonrakerClient.getConnection()

    const pageUp = metaData[button.customId].page_up
    const page = chatUtil.retrieveCurrentPage(embed)

    await executeMessage(button, page, pageUp)
}

async function executeMessage(button, page, pageUp) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const {channel} = button

    let timeout = 0

    commandFeedback[channel.id] = undefined
    requester[channel.id] = button.user
    
    await button.update(chatUtil.getWaitEmbed(button.user, commandlocale.embed.title, 'printlist.png'))

    connection.on('message', (message) => handler(message, channel, page, pageUp))
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback[channel.id]) !== 'undefined') {
            await button.message.edit(commandFeedback[channel.id])
            clearInterval(feedbackInterval)
        }
        if (timeout === 10) {
            await button.message.edit({
                content: locale.errors.no_files_found,
                components: []
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
    if (/(modified)/g.test(JSON.stringify(messageJson))) {
        connection.removeListener('message', handler)
        commandFeedback[channel.id] = await chatUtil.generatePageEmbed(
            pageUp,
            page,
            messageJson.result,
            commandlocale.embed.title,
            'printlist.png',
            requester[channel.id])
    }
}