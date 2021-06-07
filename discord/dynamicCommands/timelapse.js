const { SlashCommand } = require('slash-create')
const Discord = require('discord.js')
const config = require(`${args[0]}/mooncord.json`)
const variablesUtil = require('../../utils/variablesUtil')

async function generateEmbed() {
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`Timelapse of ${variablesUtil.getLastGcodeFile()}`)
        .setAuthor(variablesUtil.getLastGcodeFile())
        .attachFiles('./temp/timelapse/timelapse.gif')
    
    return embed
}

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        console.log('timelapse command')
        super(creator, {
            name: 'timelapse',
            description: 'Get the latest Timelapse.'
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
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