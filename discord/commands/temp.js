const logSymbols = require('log-symbols')
const Discord = require('discord.js')
const path = require('path')
const { SlashCommandBuilder } = require('@discordjs/builders')

const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.temp
const syntaxLocale = locale.syntaxlocale.commands.temp

let commandFeedback
let connection

let lastid = 0

module.exports.command = () => {
    console.log('  Load Temp Command'.commandload)
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        connection = moonrakerClient.getConnection()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

        let timeout = 0

        commandFeedback = undefined

        await interaction.deferReply()

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)

        const feedbackInterval = setInterval(async () => {
            if (typeof (commandFeedback) !== 'undefined') {
                {
                    if( lastid === id ) { return }
                    lastid = id
                    await interaction.editReply(commandFeedback)
                    lastid = 0
                }
                clearInterval(feedbackInterval)
            }
            if (timeout === 4) {
                await interaction.editReply({
                    content: locale.errors.command_timeout
                })
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
            }
            timeout++
        }, 500)

    } catch (error) {
        console.log(logSymbols.error, `Temp Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        await interaction.reply(locale.errors.command_failed)
    }
}

function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (JSON.stringify(messageJson).includes('temperature')) {
        const temps = messageJson.result

        const iconAttachment = new Discord.MessageAttachment(path.resolve(__dirname, '../../images/temps.png'))

        const tempEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(messageLocale.embed.title)
            .setThumbnail('attachment://temps.png')
        
        for (const temp in temps) {

            const currentTemp = temps[temp].temperatures[temps[temp].temperatures.length - 1]

            if (temp.includes('temperature_sensor')) {
                tempEmbed.addField(`🌡${temp.replace('temperature_sensor ', '')}`,`\`${currentTemp}°C\``, true)
            } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]
                const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])

                tempEmbed.addField(`♨${temp.replace('heater_generic ', '')}`, `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                 ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\`
                 ${messageLocale.embed.fields.current_power}:\`${power}%\``, true)
            } else if (temp.includes('temperature_fan')) {
                const targetTemp = temps[temp].targets[temps[temp].targets.length - 1]

                let data = `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                    ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\``

                if(typeof(temps[temp].powers) !== 'undefined') {
                    const power = calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])
                    data = `${data}
                    ${messageLocale.embed.fields.current_power}:\`${power}%\``
                }

                if(typeof(temps[temp].speeds) !== 'undefined') {
                    const speed = temps[temp].speeds[temps[temp].speeds.length - 1]
                    data = `${data}
                    ${messageLocale.embed.fields.current_speed}:\`${speed}rpm\``
                }

                tempEmbed.addField(`❄${temp}`, data)
            }
        }
        commandFeedback = {embeds: [tempEmbed], files: [iconAttachment]}
        connection.removeListener('message', handler)
    }
}

function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}