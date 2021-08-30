const Discord = require('discord.js')

const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metaData = require('../commands-metadata/print_job.json')

let commandFeedback
let connection

let timeout = 0

const commandlocale = locale.commands.printjob

module.exports = async (button) => {
    const {message, user, guildId, client, customId} = button

    if (!await permission.hasAdmin(user, guildId, client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }
    switch (customId) {
        case ("printjob_start"): {
            await button.update({ components: [] })
            await message.removeAttachments()
            startPrintJob(button)
            break
        }
        case ("printjob_start_no"): {
            await message.edit({ embeds: [getAbortEmbed(message, user)], components: [] })
            break
        }
        case ("printjob_start_yes"): {
            await message.edit({ embeds: [getStartEmbed(message, user)], components: [] })
            startPrint(message)
            break
        }
        default: break
    }
}

async function postStart(message, button) {
    commandFeedback = undefined

    if (typeof (message.embeds) === 'undefined') {
        await button.message.edit(message)
        return
    }
    const buttons = chatUtil.getButtons(metaData)

    message.components = [buttons]

    await button.message.edit(message)
}

function startPrint(currentMessage) {
    const currentEmbed = currentMessage.embeds[0]
    const gcodeFile = currentEmbed.author.name
    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "printer.print.start", "params": {"filename": "${gcodeFile}"}, "id": ${id}}`)
}

function getAbortEmbed(currentMessage, user) {
    const currentEmbed = currentMessage.embeds[0]
    const abortMessage = commandlocale.answer.abort.replace(/(\${username})/g, user.username)
    return new Discord.MessageEmbed()
        .setColor('#c90000')
        .setAuthor(currentEmbed.author.name)
        .setThumbnail('attachment://thumbnail.png')
        .setDescription(abortMessage)
}

function getStartEmbed(currentMessage, user) {
    const currentEmbed = currentMessage.embeds[0]
    const startMessage = commandlocale.answer.executed.replace(/(\${username})/g, user.username)
    return new Discord.MessageEmbed()
        .setColor('#25db00')
        .setAuthor(currentEmbed.author.name)
        .setThumbnail('attachment://thumbnail.png')
        .setDescription(startMessage)
}

function startPrintJob(button) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const gcodefile = button.message.embeds[0].author.name

    timeout = 0
    
    connection = moonrakerClient.getConnection()
    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

    const feedbackHandler = setInterval(() => {
        if (timeout === 6) {
            clearInterval(feedbackHandler)
            connection.removeListener('message', handler)

            const timeoutEmbed = new Discord.MessageEmbed()
                .setColor('#c90000')
                .setAuthor(gcodefile)
                .setThumbnail('attachment://thumbnail.png')
                .setDescription(locale.errors.command_timeout)

            postStart(
                { embeds: [timeoutEmbed] },
                button)
            return
        }

        timeout++

        if (typeof (commandFeedback) === 'undefined') {
            return
        }

        if (commandFeedback === 'Not Found!') {
            clearInterval(feedbackHandler)

            const notFoundEmbed = new Discord.MessageEmbed()
                .setColor('#c90000')
                .setAuthor(gcodefile)
                .setThumbnail('attachment://thumbnail.png')
                .setDescription(locale.errors.file_not_found)

            postStart(
                { embeds: [notFoundEmbed] },
                button)
            return
        }
        if (commandFeedback.files.length === 0) {
            return
        }
        clearInterval(feedbackHandler)
        postStart(
            commandFeedback,
            button)
    }, 500)
}

async function handler(message) {
    if (message.type !== 'utf8') { return }
    
    const messageJson = JSON.parse(message.utf8Data)

    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.filename) === 'undefined') { return }
    
    commandFeedback = await handlers.printFileHandler(message, commandlocale.embed.title, '#0099ff')
    connection.removeListener('message', handler)
}