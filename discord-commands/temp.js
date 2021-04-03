const { SlashCommand } = require('slash-create');
const variables = require('../utils/variablesUtil')

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
            let alltemps = ''
            const temps = variables.getTemps()
            for (const temp in temps) {
                if (temp.includes('temperature_sensor')) {
                    alltemps = alltemps.concat(`**🌡${temp.replace('temperature_sensor ', '')}:**\n\`${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\`\n\n`)
                } else if (temp.includes('extruder') || temp.includes('heater_bed') || temp.includes('heater_generic')) {
                    alltemps = alltemps.concat(`**♨${temp.replace('heater_generic ', '')}:**\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Power:${calculatePercent(temps[temp].powers[temps[temp].powers.length - 1])}%\`\n\n`)
                } else if (temp.includes('temperature_fan')) {
                    alltemps = alltemps.concat(`**❄${temp}**:\n\`Current:${temps[temp].temperatures[temps[temp].temperatures.length - 1]}°C\` \`Target:${temps[temp].targets[temps[temp].targets.length - 1]}°C\` \`Speed:${calculatePercent(temps[temp].speeds[temps[temp].speeds.length - 1])}\`\n\n`)
                }
            }
            console.log(alltemps)
            return alltemps
        }
        catch (err) {
            console.log((err).error)
            return "An Error occured!"
        }
    }
}