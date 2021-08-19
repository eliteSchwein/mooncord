const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const chatUtil = require('../../utils/chatUtil')

const metaData = require('../buttons-metadata/list_files.json')

const commandlocale = locale.commands.listfiles

let commandFeedback
let pageUp
let page
let connection

module.exports = async (button) => {
    const message = button.message

    if (message.author.id !== button.client.user.id) { return }
    if (!Object.keys(metaData).includes(button.customId)) { return }

    if (typeof (commandFeedback) !== 'undefined') {
        await button.reply(locale.getCommandNotReadyError(interaction.user.username))
        return
    }

    const embed = message.embeds[0]

    if(embed.title !== commandlocale.embed.title) { return }

    connection = moonrakerClient.getConnection()

    pageUp = metaData[button.customId].page_up
    page = chatUtil.retrieveCurrentPage(embed)

    await executeMessage(button)
}

async function executeMessage(button) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    let timeout = 0
    
    await button.update(chatUtil.getWaitEmbed(button.user, commandlocale.embed.title, 'printlist.png'))

    connection.on('message', (message) => handler(message))
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback) !== 'undefined') {
            await button.message.edit(commandFeedback)
            connection.removeListener('message', handler)
            commandFeedback = undefined
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

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
        console.log(messageJson)
    if (/(modified)/g.test(JSON.stringify(messageJson))) {
        connection.removeListener('message', handler)
        commandFeedback = await chatUtil.generatePageEmbed(
            pageUp,
            page,
            messageJson.result,
            commandlocale.embed.title,
            'printlist.png')
    }
}