const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js')

const thumbnail = require('../utils/thumbnailUtil')
const permission = require('../utils/permissionUtil')
const variables = require('../utils/variablesUtil')
const moonrakerClient = require('../clients/moonrakerclient')

let commandFeedback
let connection

let timeout = 0

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
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
            const id = Math.floor(Math.random() * 10000) + 1
            connection = moonrakerClient.getConnection()
            if (subcommand === 'resume') {
                if (variables.getStatus() !== 'pause') {
                    return `${ctx.user.username} the Print Job isn\`t currently Pausing!`
                }
                connection.send(`{"jsonrpc": "2.0", "method": "printer.print.resume", "id": ${id}}`)
                return `${ctx.user.username} you resumed the Print Job!`
            }
            if (subcommand === 'cancel') {
                if (variables.getStatus() !== 'printing' && variables.getStatus() !== 'pause') {
                    return `${ctx.user.username} there isn\`t currently any active Print Job!`
                }
                connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "CANCEL_PRINT"}, "id": ${id}}`)
                return `${ctx.user.username} you canceled the Print Job!`
            }
            if (subcommand === 'pause') {
                if (variables.getStatus() === 'pause') {
                    return `${ctx.user.username} the current Print Job is already Paused!`
                }
                if (variables.getStatus() !== 'printing') {
                    return `${ctx.user.username} there isn\`t currently any active Print Job!`
                }
                connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "PAUSE"}, "id": ${id}}`)
                return `${ctx.user.username} you paused the Print Job!`
            }
            if (subcommand === 'start') {
                const gcodefile = ctx.options[subcommand].file
                connection.on('message', handler)
                connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

                commandFeedback = undefined
                ctx.defer(false)

                const feedbackInterval = setInterval(() => {
                    if (typeof (commandFeedback) !== 'undefined') {
                        if (commandFeedback === 'Not Found!') {
                            ctx.send({
                                content: 'File not Found!'
                            })
                        } else {
                            if (commandFeedback.files.length !== 0) {
                                const thumbnail = commandFeedback.files[0]
                                const files = {
                                    name: thumbnail.name,
                                    file: thumbnail.attachment
                                }
                                console.log(await ctx.send({
                                    file: files,
                                    embeds: [commandFeedback.toJSON()]
                                }));
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
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
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