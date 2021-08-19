const moonrakerClient = require('../../clients/moonrakerClient')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')

let commandFeedback
let connection

let lastid = 0

module.exports = async (selection) => {
    const message = selection.message
    const user = selection.user

    if (message.author.id !== selection.client.user.id) { return }
    if (selection.customId !== 'view_printjob') { return }

    if (typeof (commandFeedback) !== 'undefined') {
        await selection.reply(locale.getCommandNotReadyError(selection.user.username))
        return
    }

    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    connection = moonrakerClient.getConnection()

    await selection.update({components: []})

    const gcodeFile = selection.values[0]

    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodeFile}"}, "id": ${id}}`)
    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback) !== 'undefined') {
            if( lastid === id ) { return }
            lastid = id
            if (commandFeedback === 'Not Found!') {
                await selection.message.edit({
                    content: locale.errors.file_not_found
                })
            } else {
                await selection.message.edit(commandFeedback)
            }
            lastid = 0
            commandFeedback = undefined
            connection.removeListener('message', handler)
            clearInterval(feedbackInterval)
        }
        if (timeout === 4) {
            await selection.message.edit({
                content: locale.errors.command_timeout
            })
            commandFeedback = undefined
            clearInterval(feedbackInterval)
            connection.removeListener('message', handler)
        }
        timeout++
    }, 500)
}

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, locale.fileinfo.title, '#0099ff')
    connection.removeListener('message', handler)
}