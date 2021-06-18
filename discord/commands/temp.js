const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const { SlashCommand } = require('slash-create')
const logSymbols = require('log-symbols')

const moonrakerClient = require('../../clients/moonrakerclient')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.temp

let commandFeedback
let connection

module.exports = class TempCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Temp Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description
        })
        this.filePath = __filename
    }

    run(ctx) {
        connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * parseInt('10_000')) + 1

        let timeout = 0

        commandFeedback = undefined

        ctx.defer(false)

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)

        const feedbackInterval = setInterval(() => {
            if (typeof (commandFeedback) !== 'undefined') {
                {
                    const thumbnail = commandFeedback.files[0]
                    const files = {
                        name: thumbnail.name,
                        file: thumbnail.attachment
                    }
                    ctx.send({
                        file: files,
                        embeds: [commandFeedback.toJSON()]
                    })
                }
                clearInterval(feedbackInterval)
            }
            if (timeout === 4) {
                ctx.send({
                    content: locale.errors.command_timeout
                })
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
            }
            timeout++
        }, 500)
    }
    onError(error, ctx) {
        console.log(logSymbols.error, `Temp Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
        connection.removeListener('message', handler)
        commandFeedback = undefined
    }
    onUnload() {
        return 'okay'
    }
}

function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (JSON.stringify(messageJson).includes('temperature')) {
        const temps = messageJson.result

        const iconpath = path.resolve(__dirname, '../../images/temps.png')

        const iconbuffer = fs.readFileSync(iconpath)

        const iconattachment = new Discord.MessageAttachment(iconbuffer, 'temps.png')

        commandFeedback = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(commandlocale.embed.title)
            .setThumbnail('attachment://temps.png')
            .attachFiles(iconattachment)
        
        for (const temp in temps) {

            const currentTemp = temps[temp].temperatures[temps[temp].temperatures.length - 1]

            if (temp.includes('temperature_sensor')) {
                commandFeedback.addField(`🌡${temp.replace('temperature_sensor ', '')}`,`\`${currentTemp}°C\``, true)
            } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`♨${temp.replace('heater_generic ', '')}`, `${commandlocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                 ${commandlocale.embed.fields.target_temp}:\`${targetTemp}°C\`
                 ${commandlocale.embed.fields.current_power}:\`${power}%\``, true)
            } else if (temp.includes('temperature_fan')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`❄${temp}`, `${commandlocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                 ${commandlocale.embed.fields.target_temp}:\`${targetTemp}°C\`
                 ${commandlocale.embed.fields.current_power}:\`${power}%\``, true)
            }
        }
        connection.removeListener('message', handler)
    }
}

function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}
