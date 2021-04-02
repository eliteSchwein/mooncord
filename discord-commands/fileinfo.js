const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js')

const moonrakerClient = require('../clients/moonrakerclient')

const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

let commandFeedback
let connection

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'fileinfo',
            description: 'Execute a GCode Command',
            options: [{
                type: CommandOptionType.STRING,
                name: 'file',
                description: 'Shows Informations about a Print File.',
                required: true
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            let gcodefile = ctx.options.file
            if (!gcodefile.endsWith('.gcode')) {
                gcodefile += '.gcode'
            }

            const id = Math.floor(Math.random() * 10000) + 1
            connection = moonrakerClient.getConnection()

            let timeout = 0

            commandFeedback = undefined

            ctx.defer(false)

            connection.on('message', handler)
            connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
            const feedbackInterval = setInterval(() => {
                if (typeof (commandFeedback) !== 'undefined') {
                    if (commandFeedback === 'Not Found!') {
                        ctx.send({
                            content: 'File not Found!'
                        })
                    } else {
                        let files = {}
                        if (typeof (commandFeedback.files) !== 'undefined') {
                            const thumbnail = commandFeedback.files[0]
                            files = {
                                name: thumbnail.name,
                                file: thumbnail.attachment
                            }
                        }
                        ctx.send({
                            file: files,
                            embeds: [commandFeedback.toJSON()]
                        });
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
            return 'An Error occured!'
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
            .setTitle('File Informations')
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