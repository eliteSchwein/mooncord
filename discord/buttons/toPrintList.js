const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.listfiles

let commandFeedback
let connection

let lastid = 0
let timeout = 0

module.exports = async (button) => {
    const {message, user, guildId, client} = button

    if (message.author.id !== button.client.user.id) { return }
    if (button.customId !== 'to_printlist') { return }

    if (!await permission.hasAdmin(user, guildId, client)) {
        await button.reply(locale.getAdminOnlyError(user.username))
        return
    }
    if (typeof (commandFeedback) !== 'undefined') {
        await button.reply(locale.getCommandNotReadyError(user.username))
        return
    }

    await button.update({components: []})
    await message.removeAttachments()

    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    connection = moonrakerClient.getConnection()

    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

    commandFeedback = undefined

    const feedbackInterval = setInterval(async () => {
        if (typeof (commandFeedback) !== 'undefined') {
            if(lastid === id) { return }
            lastid = id
            
            await message.edit(commandFeedback)
            
            commandFeedback = undefined
            lastid = 0
            clearInterval(feedbackInterval)
        }
        if (timeout === 10) {
            commandFeedback = undefined
            connection.removeListener('message', handler)
            clearInterval(feedbackInterval)

            const timeoutEmbed = new Discord.MessageEmbed()
                .setColor('#c90000')
                .setDescription(locale.errors.no_files_found)

            await message.edit(timeoutEmbed)
        }
        timeout++
    }, 500)
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if(/(modified)/g.test(JSON.stringify(messageJson))) {
        connection.removeListener('message', handler)
        commandFeedback = await chatUtil.generatePageEmbed(
            false,
            1,
            messageJson.result,
            messageLocale.embed.title,
            'printlist.png',
            true)
    }
}