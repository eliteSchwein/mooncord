const { SlashCommand } = require('slash-create')

const variables = require('../utils/variablesUtil')
const moonrakerClient = require('../clients/moonrakerclient')

let commandFeedback
let connection

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
            name: 'temp',
            description: 'Get the current Temperatures from Klipper.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            
            connection = moonrakerClient.getConnection()
            const id = Math.floor(Math.random() * 10000) + 1

            let timeout = 0

            commandFeedback = undefined

            ctx.defer(false)

            connection.on('message', handler)
            connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${id}}`)

            const feedbackInterval = setInterval(() => {
                if (typeof (commandFeedback) !== 'undefined') {
                    {
                        ctx.send({
                            content: commandFeedback
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
        catch (err) {
            console.log((err).error)
            connection.removeListener('message', handler)
            return "An Error occured!"
        }
    }
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if (JSON.stringify(messageJson).includes('temperature')) {
        const temps = messageJson.result
        let alltemps = ''
        for (const temp in temps) {
            if (temp.includes('temperature_sensor')) {
                alltemps = alltemps.concat(`**🌡${temp.replace('temperature_sensor ', '')}:**\n\`${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\`\n\n`)
            } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                alltemps = alltemps.concat(`**♨${temp.replace('heater_generic ', '')}:**\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Power:${calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])}%\`\n\n`)
            } else if (temp.includes('temperature_fan')) {
                alltemps = alltemps.concat(`**❄${temp}**:\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Speed:${calculatePercent(temps[temp].speeds[temps[temp].speeds.length - 1])}\`\n\n`)
            }
        }
        commandFeedback = alltemps
        connection.removeListener('message', handler)
    }
}