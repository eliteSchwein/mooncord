const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js')

const thumbnail = require('../utils/thumbnailUtil')
const permission = require('../utils/permissionUtil')
const variables = require('../utils/variablesUtil')
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
                    if (commandFeedback === 'Not Found!') {
                        ctx.send({
                            content: 'There are currently no Files!'
                        })
                    } else {
                        if (commandFeedback.files.length !== 0) {
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
                        } else {
                            ctx.send({
                                embeds: [commandFeedback.toJSON()]
                            });
                        }
                    }
                    clearInterval(feedbackInterval)
                }
                if (timeout === 4) {
                    ctx.send({
                        content: 'Command execution failed!'
                    })
                    clearInterval(feedbackInterval)
                }
                timeout++
            }, 500)
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    console.log(message)
    if (typeof (messageJson.error) !== 'undefined') {
        commandFeedback = `Not Found!`
        connection.removeListener('message', handler)
        return
    }
    if (typeof (messageJson.result.filename) !== 'undefined') {
        let description = ''
            .concat(`Print Time: ${variables.formatTime(messageJson.result.estimated_time * 1000)}\n`)
            .concat(`Slicer: ${messageJson.result.slicer}\n`)
            .concat(`Slicer Version: ${messageJson.result.slicer_version}\n`)
            .concat(`Height: ${messageJson.result.object_height}mm`)
        
        commandFeedback = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Start Print Job?')
            .setAuthor(messageJson.result.filename)
            .setDescription(description)
        if (typeof (messageJson.result.thumbnails) !== 'undefined') {
            const parsedThumbnail = await thumbnail.buildThumbnail(messageJson.result.thumbnails[1].data)
            commandFeedback
                .attachFiles(parsedThumbnail)
                .setThumbnail(`attachment://${parsedThumbnail.name}`)
        }
        connection.removeListener('message', handler)
        return
    }
}