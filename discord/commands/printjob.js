const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const discordClient = require('../../clients/discordclient')
const moonrakerClient = require('../../clients/moonrakerclient')
const handlers = require('../../utils/handlerUtil')
const permission = require('../../utils/permissionUtil')
const variables = require('../../utils/variablesUtil')
const metadata = require('../commands-metadata/printjob.json')

let commandFeedback
let connection

let timeout = 0

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'printjob',
            description: 'Control or start a Print Job.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'pause',
                description: 'Pause Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'cancel',
                description: 'Cancel Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'resume',
                description: 'Resume Print Job'
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'start',
                description: 'Start new Print Job',
                options: [{
                    type: CommandOptionType.STRING,
                    name: 'file',
                    description: 'Select a Print File.',
                    required: true
                }]
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }
            const subcommand = ctx.subcommands[0]
            const currentStatus = variables.getStatus()
            const id = Math.floor(Math.random() * parseInt('10_000')) + 1

            connection = moonrakerClient.getConnection()

            if (typeof (commandFeedback) !== 'undefined') {
                return `This Command is not ready, ${ctx.user.username}!`
            }

            if (Object.keys(metadata).includes(subcommand)) {
                const subcommandmeta = metadata[subcommand]
                if (subcommand === currentStatus) {
                    return subcommandmeta.statusSame.replace(/(\${username})/g, ctx.user.username)
                }

                if (!subcommandmeta.requiredStatus.includes(currentStatus)) {
                    return subcommandmeta.statusNotValid.replace(/(\${username})/g, ctx.user.username)
                }
                connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${subcommandmeta.macro}"}, "id": ${id}}`)
                return subcommandmeta.statusValid.replace(/(\${username})/g, ctx.user.username)
            }
            
            if (subcommand === 'start') {
                ctx.defer(false)

                startPrintJob(ctx)
            }
        }
        catch (error) {
            console.log(logSymbols.error, `Printjob Command: ${error}`.error)
            connection.removeListener('message', handler)
            commandFeedback = undefined
            return "An Error occured!"
        }
    }
    async onUnload() {
        return 'okay'
    }
}

async function addEmotes(commandContext, commandMessage) {
    const channel = await discordClient.getClient().channels.fetch(commandContext.channelID)
    const message = await channel.messages.fetch(commandMessage.id)
    message.react('✅')
    message.react('❌')
}

async function postStart(message, commandContext) {
    const commandmessage = await commandContext.send(message)
    
    commandFeedback = undefined

    if (typeof (message.embeds) === 'undefined') { return }

    addEmotes(commandContext, commandmessage)
}

function startPrintJob(commandContext) {
    const id = Math.floor(Math.random() * parseInt('10_000')) + 1
    const gcodefile = commandContext.options.start.file
    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

    const feedbackHandler = setInterval(() => {
        if (timeout === 4) {
            clearInterval(feedbackHandler)
            postStart({
                content: 'Command execution failed!'
            }, commandContext)
            return
        }

        timeout++

        if (typeof (commandFeedback) === 'undefined') { return }

        if (commandFeedback === 'Not Found!') {
            clearInterval(feedbackHandler)
            postStart({
                content: 'File not Found!'
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

async function handler (message) {
    commandFeedback = await handlers.printFileHandler(message, 'Start Print Job?', '#0099ff')
    connection.removeListener('message', handler)
}