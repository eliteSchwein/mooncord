const logSymbols = require('log-symbols')
const { SlashCommand } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const metaData = require('../commands-metadata/list_files.json')

const messageLocale = locale.commands.listfiles
const syntaxLocale = locale.syntaxlocale.commands.listfiles

let commandFeedback
let connection

let lastid = 0
let timeout = 0

module.exports = class ListFilesCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load List Files Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (typeof (commandFeedback) !== 'undefined') {
            return locale.getCommandNotReadyError(ctx.user.username)
        }
        if (!await permission.hasAdmin(ctx.user, ctx.guildID, discordClient.getClient)) {
            return locale.getAdminOnlyError(ctx.user.username)
        }
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

        commandFeedback = undefined
        ctx.defer(false)

        const feedbackInterval = setInterval(async () => {
            if (typeof (commandFeedback) !== 'undefined') {
                if(lastid === id) { return }
                lastid = id
                const thumbnail = commandFeedback.files[0]
                const buttons = chatUtil.getButtons(metaData)
                const files = {
                    name: thumbnail.name,
                    file: thumbnail.attachment
                }
                const commandmessage = await ctx.send({
                    file: files,
                    embeds: [commandFeedback.toJSON()],
                    component: buttons
                })
                commandFeedback = undefined
                const channel = await discordClient.getClient.channels.fetch(ctx.channelID)
                const message = await channel.messages.fetch(commandmessage.id)
                
                lastid = 0
                clearInterval(feedbackInterval)
            }
            if (timeout === 10) {
                ctx.send({
                    content: locale.errors.no_files_found
                })
                commandFeedback = undefined
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
            }
            timeout++
        }, 500)
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Listfiles Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
        connection.removeListener('message', handler)
        commandFeedback = undefined
    }

    onUnload() {
        return 'okay'
    }
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
            'printlist.png')
    }
}
