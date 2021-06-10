const args = process.argv.slice(2)

const Discord = require('discord.js')
const path = require('path')
const { SlashCommand, CommandOptionType } = require('slash-create')
const variablesUtil = require('../../utils/variablesUtil')
const timelapseUtil = require('../../utils/timelapseUtil')
const config = require(`${args[0]}/mooncord.json`)

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        let guildId = undefined
        if (!config.timelapse.enable) {
            guildId = '000000000000000000'
        }
        super(creator, {
            name: 'timelapse',
            description: 'Get the latest Timelapse.',
            guildIDs: guildId,
            options: [{
                type: CommandOptionType.STRING,
                name: 'emulate',
                description: 'Emulate file name.',
                required: false
            }]
        })
    }

    async run(ctx) {
        try {

            ctx.defer(false)

            if (typeof(ctx.options.emulate) != "undefined") {
                const { emulate } = ctx.options
                variablesUtil.setCurrentFile(emulate)
                variablesUtil.updateLastGcodeFile()
                variablesUtil.setCurrentFile('')

                await timelapseUtil.render()
            }

            if (variablesUtil.getLastGcodeFile() === '') {
                return "There is no Thumbnail aviable!"
            }

            const timelapse = timelapseUtil.getTimelapse()

            const files = {
                name: timelapse.name,
                file: timelapse.attachment
            }
            const embed = new Discord.MessageEmbed()
            .setDescription(`\`Timelapse for ${variablesUtil.getLastGcodeFile()}\``)
            .attachFiles(timelapse)

            await ctx.send({
                embeds: [embed.toJSON()],
                file: files
            })
        }
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
    }
}