const Discord = require('discord.js')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const { SlashCommand } = require('slash-create')

const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.temp
const syntaxLocale = locale.syntaxlocale.commands.temp

module.exports = class TempCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Temp Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description
        })
        this.filePath = __filename
    }

    run(ctx) {
        const connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

        let timeout = 0
        let commandFeedback

        ctx.defer(false)

        connection.on('message', (message) => handler(message, commandFeedback, connection))
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

function handler (message, commandFeedback, connection) {
    if (message.type !== 'utf8') { return }

    const messageJson = JSON.parse(message.utf8Data)
    
    if (typeof(messageJson.result) === 'undefined') { return }

    console.log(messageJson)

    if (JSON.stringify(messageJson).includes('temperature')) {
        const temps = messageJson.result

        const iconpath = path.resolve(__dirname, '../../images/temps.png')

        const iconbuffer = fs.readFileSync(iconpath)

        const iconattachment = new Discord.MessageAttachment(iconbuffer, 'temps.png')

        commandFeedback = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(messageLocale.embed.title)
            .setThumbnail('attachment://temps.png')
            .attachFiles(iconattachment)
        
        for (const temp in temps) {

            const currentTemp = temps[temp].temperatures[temps[temp].temperatures.length - 1]

            if (temp.includes('temperature_sensor')) {
                commandFeedback.addField(`🌡${temp.replace('temperature_sensor ', '')}`,`\`${currentTemp}°C\``, true)
            } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`♨${temp.replace('heater_generic ', '')}`, `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                 ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\`
                 ${messageLocale.embed.fields.current_power}:\`${power}%\``, true)
            } else if (temp.includes('temperature_fan')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`❄${temp}`, `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                 ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\`
                 ${messageLocale.embed.fields.current_power}:\`${power}%\``, true)
            }
        }
        connection.removeListener('message', handler)
    }
}

function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}
