const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js')

const thumbnail = require('../../utils/thumbnailUtil')
const permission = require('../../utils/permissionUtil')
const variables = require('../../utils/variablesUtil')
const moonrakerClient = require('../../clients/moonrakerclient')
const discordClient = require('../../clients/discordclient')

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
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }
            const subcommand = ctx.subcommands[0]
            const currentStatus = variables.getStatus()
            const id = Math.floor(Math.random() * 10000) + 1

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
                startPrintJob(ctx, (response) => {
                    console.log(response)
                    const commandmessage = await ctx.send(response)

                    if (typeof (response.embeds) === 'undefined') { return }

                    addEmotes(ctx, commandmessage)
                })
            }
        }
        catch (err) {
            console.log((err).error)
            connection.removeListener('message', handler)
            commandFeedback = undefined
            return "An Error occured!"
        }
    }
}

async function addEmotes(commandContext, commandMessage) {
    const channel = await discordClient.getClient().channels.fetch(commandContext.channelID)
    const message = await channel.messages.fetch(commandMessage.id)
    message.react('✅')
    message.react('❌')
}

function startPrintJob(commandContext, callback) {
    const id = Math.floor(Math.random() * 10000) + 1
    const gcodefile = commandContext.options[subcommand].file
    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

    commandFeedback = undefined

    const feedbackHandler = setInterval(() => {
        if (timeout === 4) {
            commandFeedback = undefined
            clearInterval(feedbackHandler)
            callback ({
                content: 'Command execution failed!'
            })
        }

        timeout++

        if (typeof (commandFeedback) === 'undefined') { return }

        if (commandFeedback === 'Not Found!') {
            commandFeedback = undefined
            clearInterval(feedbackHandler)
            callback({
                content: 'File not Found!'
            })
        }
        if (commandFeedback.files.length === 0) {
            clearInterval(feedbackHandler)
            callback({
                embeds: [commandFeedback.toJSON()]
            })
        }
        const thumbnail = commandFeedback.files[0]
        const files = {
            name: thumbnail.name,
            file: thumbnail.attachment
        }
        commandFeedback = undefined
        clearInterval(feedbackHandler)
        callback({
            file: files,
            embeds: [commandFeedback.toJSON()]
        })
    }, 500)
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
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