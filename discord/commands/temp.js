const Discord = require('discord.js')
const logSymbols = require('log-symbols')
const path = require('path')

const locale = require('../../utils/localeUtil')
const variablesUtil = require('../../utils/variablesUtil')

const messageLocale = locale.commands.temp

module.exports.reply = async (interaction) => {
    try {
        await interaction.deferReply()

        const message = buildEmbed()

        await interaction.editReply(message)
    } catch (error) {
        console.log(logSymbols.error, `Temp Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}

function buildEmbed() {
    const temps = variablesUtil.getTemperatures()

    const iconAttachment = new Discord.MessageAttachment(path.resolve(__dirname, '../../images/temps.png'))

    const tempEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(messageLocale.embed.title)
        .setThumbnail('attachment://temps.png')
    
    for (const temp in temps) {
        const currentTemp = temps[temp].temperature

        if (temp.includes('temperature_sensor')) {
            tempEmbed.addField(`🌡${temp.replace('temperature_sensor ', '')}`,`\`${currentTemp}°C\``, true)
        } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
            const targetTemp = temps[temp].target
            const power = calculatePercent(temps[temp].power)

            tempEmbed.addField(`♨${temp.replace('heater_generic ', '')}`, `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
             ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\`
             ${messageLocale.embed.fields.current_power}:\`${power}%\``, true)
        } else if (temp.includes('temperature_fan')) {
            const targetTemp = temps[temp].target

            let data = `${messageLocale.embed.fields.current_temp}: \`${currentTemp}°C\`
                ${messageLocale.embed.fields.target_temp}:\`${targetTemp}°C\``

            if(typeof(temps[temp].power) !== 'undefined') {
                const power = calculatePercent(temps[temp].power)
                data = `${data}
                ${messageLocale.embed.fields.current_power}:\`${power}%\``
            }

            if(typeof(temps[temp].speed) !== 'undefined') {
                const speed = temps[temp].speed
                data = `${data}
                ${messageLocale.embed.fields.current_speed}:\`${speed}rpm\``
            }

            tempEmbed.addField(`❄${temp}`, data)
        }
    }
    return {embeds: [tempEmbed], files: [iconAttachment]}
}

function calculatePercent (input) {
  const percent = 100 * input
  return percent.toFixed(0)
}