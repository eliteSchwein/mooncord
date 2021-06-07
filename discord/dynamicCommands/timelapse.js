const args = process.argv.slice(2)

const Discord = require('discord.js')
const { SlashCommand } = require('slash-create')
const variablesUtil = require('../../utils/variablesUtil')
const timelapseUtil = require('../../utils/timelapseUtil')
const config = require(`${args[0]}/mooncord.json`)

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        let guildId = undefined
        if (!config.thumbnail.enable) {
            guildId = '000000000000000000'
        }
        super(creator, {
            name: 'timelapse',
            description: 'Get the latest Timelapse.',
            guildIDs: guildId,
            options: [{
                type: CommandOptionType.STRING,
                name: 'emulate',
                description: 'Just something.',
                required: true
            }]
        })
    }

    async run(ctx) {
        try {

            ctx.defer(false)

            if (ctx.options.length > 0) {
                const { emulate } = ctx.options
                variablesUtil.setCurrentFile(emulate)
                variablesUtil.updateLastGcodeFile()
                variablesUtil.setCurrentFile('')
                let frames = 240
                setInterval(async () => {
                    if (frames < 1) {
                        timelapseUtil.render()
                        const embed = await generateEmbed()

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
                    timelapseUtil.makeFrame()
                    frames--
                },100)
            }

            if (variablesUtil.getLastGcodeFile() === '') {
                return "There is no Thumbnail aviable!"
            }
            const embed = await generateEmbed()

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
        .setTitle(`Timelapse of ${variablesUtil.getLastGcodeFile()}`)
        .setAuthor(variablesUtil.getLastGcodeFile())
        .attachFiles('./temp/timelapse/timelapse.gif')
    
    return embed
}