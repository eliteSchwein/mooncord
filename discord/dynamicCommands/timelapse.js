const args = process.argv.slice(2)

const Discord = require('discord.js')
const { SlashCommand } = require('slash-create')
const variablesUtil = require('../../utils/variablesUtil')
const config = require(`${args[0]}/mooncord.json`)

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        if (!config.thumbnail.enable) {
            super(creator, {
                name: 'timelapse',
                description: 'Get the latest Timelapse.',
                guildIDs: '000000000000000000'
            })
            this.filePath = __filename
        } else {
            super(creator, {
                name: 'timelapse',
                description: 'Get the latest Timelapse.'
            })
            this.filePath = __filename
        }
    }

    async run(ctx) {
        try {

            ctx.defer(false)

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