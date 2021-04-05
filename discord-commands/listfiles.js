const { SlashCommand } = require('slash-create');

const chatUtil = require('../utils/chatUtil')
const permission = require('../utils/permissionUtil')
const moonrakerClient = require('../clients/moonrakerclient')
const discordClient = require('../clients/discordclient')

let commandFeedback
let connection

let timeout = 0

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'listfiles',
            description: 'List all Print Files.',
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }
            const id = Math.floor(Math.random() * 10000) + 1
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
                    });
                    const channel = await discordClient.getClient().channels.fetch(ctx.channelID)
                    const message = await channel.messages.fetch(commandmessage.id)
                    message.react('◀️')
                    message.react('▶️')
                    clearInterval(feedbackInterval)
                }
                if (timeout === 10) {
                    ctx.send({
                        content: 'There are currently no Files!'
                    })
                    connection.removeListener('message', handler)
                    clearInterval(feedbackInterval)
                }
                timeout++
            }, 500)
        }
        catch (err) {
            console.log((err).error)
            connection.removeListener('message', handler)
            return "An Error occured!"
        }
    }
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (JSON.stringify(messageJson).match(/(filename|modified)/g)) {
        commandFeedback = await chatUtil.generatePageEmbed(
            true,
            -1,
            messageJson.result,
            'Print Files',
            'printlist.png')
        connection.removeListener('message', handler)
    }
}