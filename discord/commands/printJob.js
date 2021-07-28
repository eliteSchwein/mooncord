const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const statusUtil = require('../../utils/statusUtil')
const metaData = require('../commands-metadata/print_job.json')

const messageLocale = locale.commands.printjob
const syntaxLocale = locale.syntaxlocale.commands.printjob

let commandFeedback
let connection

let timeout = 0

module.exports = class PrintJobCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Print Job Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: syntaxLocale.options.pause.name,
                description: messageLocale.options.pause.description
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: syntaxLocale.options.cancel.name,
                description: messageLocale.options.cancel.description
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: syntaxLocale.options.resume.name,
                description: messageLocale.options.resume.description
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: syntaxLocale.options.start.name,
                description: messageLocale.options.start.description,
                options: [{
                    type: CommandOptionType.STRING,
                    name: syntaxLocale.options.start.options.file.name,
                    description: messageLocale.options.start.options.file.description,
                    required: true
                }]
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (!await permission.hasAdmin(ctx.user, ctx.guildID, discordClient.getClient)) {
            return locale.getAdminOnlyError(ctx.user.username)
        }
        const subcommand = ctx.subcommands[0]
        const currentStatus = statusUtil.getStatus()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

        connection = moonrakerClient.getConnection()

        if (typeof (commandFeedback) !== 'undefined') {
            return locale.getCommandNotReadyError(ctx.user.username)
        }

        const key = getKeyByValue(syntaxLocale.options, subcommand)

        if (Object.keys(metaData).includes(key)) {
            const subcommandmeta = metaData[key]
            const lang_command_meta = messageLocale.answer[key]

            if (subcommand === currentStatus) {
                return lang_command_meta.status_same.replace(/(\${username})/g, ctx.user.username)
            }

            if (!subcommandmeta.requiredStatus.includes(currentStatus)) {
                return lang_command_meta.status_not_valid.replace(/(\${username})/g, ctx.user.username)
            }
            connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${subcommandmeta.macro}"}, "id": ${id}}`)
            return lang_command_meta.status_valid.replace(/(\${username})/g, ctx.user.username)
        }
        
        if (subcommand === 'start') {
            ctx.defer(false)

            startPrintJob(ctx)
        }
    }

    onUnload() {
        return 'okay'
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Printjob Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
        connection.removeListener('message', handler)
        commandFeedback = undefined
    }
}

async function postStart(message, commandContext) {
    const commandMessage = await commandContext.send(message)
    const currentMessage = commandFeedback
    
    commandFeedback = undefined

    if (typeof (message.embeds) === 'undefined') { return }
    
    const channel = await discordClient.getClient.channels.fetch(commandContext.channelID)
    const messageComponent = await channel.messages.fetch(commandMessage.id)
    const buttons = chatUtil.getButtons(metaData)

    await messageComponent.edit({ embed: currentMessage, buttons: buttons })
}

function startPrintJob(commandContext) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const gcodefile = commandContext.options.start[syntaxLocale.options.start.options.file.name]
    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

    const feedbackHandler = setInterval(() => {
        if (timeout === 4) {
            clearInterval(feedbackHandler)
            connection.removeListener('message', handler)
            postStart({
                content: locale.errors.command_timeout
            }, commandContext)
            return
        }

        timeout++

        if (typeof (commandFeedback) === 'undefined') { return }

        if (commandFeedback === 'Not Found!') {
            clearInterval(feedbackHandler)
            postStart({
                content: locale.errors.file_not_found
            }, commandContext)
            return
        }
        if (commandFeedback.files.length === 0) {
            clearInterval(feedbackHandler)
            postStart({
                embeds: [commandFeedback.toJSON()]
            }, commandContext)
            return
        }
        const thumbnail = commandFeedback.files[0]
        const files = {
            name: thumbnail.name,
            file: thumbnail.attachment
        }
        clearInterval(feedbackHandler)
        postStart({
            file: files,
            embeds: [commandFeedback.toJSON()]
        }, commandContext)
    }, 500)
}

async function handler(message) {
    if (message.type !== 'utf8') { return }
    
    const messageJson = JSON.parse(message.utf8Data)
    
    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.filename) === 'undefined') { return }
    
    commandFeedback = await handlers.printFileHandler(message, messageLocale.embed.title, '#0099ff')
    connection.removeListener('message', handler)
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].name === value);
  }
