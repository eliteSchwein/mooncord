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
                timelapseUtil.render()
            }

            if (variablesUtil.getLastGcodeFile() === '') {
                return "There is no Thumbnail aviable!"
            }
            const embed = await generateEmbed()

            console.log(embed)

            const timelapse = embed.files[0]

            const files = {
                name: timelapse.name,
                file: timelapse.attachment
            }

            await ctx.send({
                file: files,
                embeds: [embed.toJSON()]
            })
        }
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
    }
}

async function generateEmbed() {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Timelapse')
        .setAuthor(variablesUtil.getLastGcodeFile())
        .attachFiles(path.resolve(__dirname, '../../temp/timelapse/timelapse.mp4'))
    
    return embed
}