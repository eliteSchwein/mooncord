const { SlashCommand } = require('slash-create')
const logSymbols = require('log-symbols')

const discordClient = require('../../clients/discordclient')
const moonrakerClient = require('../../clients/moonrakerclient')
const chatUtil = require('../../utils/chatUtil')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.listfiles

let commandFeedback
let connection

let timeout = 0

module.exports = class ListFilesCommand extends SlashCommand {
    constructor(creator) {
        console.log(logSymbols.info, 'Load List Files Command')
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            if (typeof (commandFeedback) !== 'undefined') {
                return locale.errors.not_ready.replace(/(\${username})/g, ctx.user.username)
            }
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return locale.errors.admin_only.replace(/(\${username})/g, ctx.user.username)
            }
            const id = Math.floor(Math.random() * parseInt('10_000')) + 1
            connection = moonrakerClient.getConnection()

            connection.on('message', handler)
            connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

            commandFeedback = undefined
            ctx.defer(false)

            const feedbackInterval = setInterval(async () => {
                if (typeof (commandFeedback) !== 'undefined') {
                    const thumbnail = commandFeedback.files[0]
                    const files = {
                        name: thumbnail.name,
                        file: thumbnail.attachment
                    }
                    const commandmessage = await ctx.send({
                        file: files,
                        embeds: [commandFeedback.toJSON()]
                    })
                    commandFeedback = undefined
                    const channel = await discordClient.getClient().channels.fetch(ctx.channelID)
                    const message = await channel.messages.fetch(commandmessage.id)
                    message.react('◀️')
                    message.react('▶️')
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
        catch (error) {
            console.log(logSymbols.error, `Listfiles Command: ${error}`.error)
            connection.removeListener('message', handler)
            commandFeedback = undefined
            return locale.errors.command_failed
        }
    }
    async onUnload() {
        return 'okay'
    }
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if(JSON.stringify(messageJson).match(/(modified)/g)) {
        connection.removeListener('message', handler)
        commandFeedback = await chatUtil.generatePageEmbed(
            false,
            1,
            messageJson.result,
            commandlocale.embed.title,
            'printlist.png')
    }
}
