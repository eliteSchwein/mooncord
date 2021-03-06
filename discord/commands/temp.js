const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const { SlashCommand } = require('slash-create')

const moonrakerClient = require('../../clients/moonrakerclient')

let commandFeedback
let connection

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'temp',
            description: 'Get the current Temperatures from Klipper.'
        });
        this.filePath = __filename;
    }

    run(ctx) {
        try {
            
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
                        });
                    }
                    clearInterval(feedbackInterval)
                }
                if (timeout === 4) {
                    ctx.send({
                        content: 'Command execution failed!'
                    })
                    connection.removeListener('message', handler)
                    clearInterval(feedbackInterval)
                }
                timeout++
           }, 500)
        }
        catch (error) {
            console.log((error).error)
            connection.removeListener('message', handler)
            return "An Error occured!"
        }
    }
}

function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (JSON.stringify(messageJson).includes('temperature')) {
        const temps = messageJson.result

        const iconpath = path.resolve(__dirname, '../../images/thermometer.png')

        const iconbuffer = fs.readFileSync(iconpath)

        const iconattachment = new Discord.MessageAttachment(iconbuffer, 'thermometer.png')

        commandFeedback = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Temperatures')
            .setThumbnail('attachment://thermometer.png')
            .attachFiles(iconattachment)
        
        for (const temp in temps) {

            const currentTemp = temps[temp].temperatures[temps[temp].temperatures.length - 1]

            if (temp.includes('temperature_sensor')) {
                commandFeedback.addField(`🌡${temp.replace('temperature_sensor ', '')}`,`\`${currentTemp}°C\``, true)
            } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`♨${temp.replace('heater_generic ', '')}`, `Current: \`${currentTemp}°C\`
                 Target:\`${targetTemp}°C\`
                 Power:\`${power}%\``, true)
            } else if (temp.includes('temperature_fan')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                commandFeedback.addField(`❄${temp}`, `Current: \`${currentTemp}°C\`
                 Target:\`${targetTemp}°C\`
                 Power:\`${power}%\``, true)
            }
        }
        connection.removeListener('message', handler)
    }
}

function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}
