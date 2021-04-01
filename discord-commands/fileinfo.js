const { SlashCommand, CommandOptionType } = require('slash-create');
const Discord = require('discord.js')

const moonrakerClient = require('../clients/moonrakerclient')

const thumbnail = require('../utils/thumbnailUtil')
const variables = require('../utils/variablesUtil')

let commandFeedback

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
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
            const connection = moonrakerClient.getConnection()

            let timeout = 0

            commandFeedback = undefined

            ctx.defer(false)

            const fileHandler = handler

            connection.on('message', fileHandler)
            connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)
            const feedbackInterval = setInterval(async () => {
                if (typeof (commandFeedback) !== 'undefined') {
                    connection.removeListener('message', fileHandler)
                    if (commandFeedback === 'Not Found!') {
                        ctx.send({
                            content: 'File not Found!'
                        })
                    } else {
                        let files = {}
                        if (typeof (commandFeedback.files) !== 'undefined') {
                            console.log(commandFeedback.files)
                            files = {
                                name: commandFeedback.files[0].name,
                                file: commandFeedback.files[0].attachment
                            }
                        }
                        await ctx.send({
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
            console.log(err)
            return 'An Error occured!'
        }
    }
}

async function handler (message) {
  const messageJson = JSON.parse(message.utf8Data)
  if (typeof (messageJson.error) !== 'undefined') {
    commandFeedback = `Not Found!`
    return
    }
    let description = ''
        .concat(`Print Time: ${variables.formatTime(messageJson.result.estimated_time * 1000)}\n`)
        .concat(`Slicer: ${messageJson.result.slicer}\n`)
        .concat(`Slicer Version: ${messageJson.result.slicer_version}\n`)
        .concat(`Height: ${messageJson.result.object_height}mm`)
    
    commandFeedback = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('File Informations')
        .setAuthor(messageJson.filename)
        .setDescription(description)
    if (typeof (messageJson.result.thumbnails) !== 'undefined') {
        const parsedThumbnail = await thumbnail.buildThumbnail(messageJson.result.thumbnails[1].data)
        commandFeedback
            .attachFiles(parsedThumbnail)
            .setThumbnail(parsedThumbnail.name)
    }
}