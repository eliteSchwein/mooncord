const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const { SlashCommand } = require('slash-create')
const logSymbols = require('log-symbols')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.info

const pjson = require('../../package.json')

module.exports = class InfoCommand extends SlashCommand {
    constructor(creator) {
        console.log(logSymbols.info, 'Load Info Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            const description = commandlocale.embed.description
                .replace(/(\${version})/g, pjson.version)
                .replace(/(\${author})/g, pjson.author)
                .replace(/(\${homepage})/g, pjson.homepage)
        
            const logopath = path.resolve(__dirname, '../../images/logo.png')

            const logobuffer = fs.readFileSync(logopath)

            const infoEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle(commandlocale.embed.title)
                .setDescription(description)
                .setThumbnail('attachment://logo.png')
        
            ctx.defer(false)

            await ctx.send({
                file: {
                    name: 'logo.png',
                    file: logobuffer
                },
                embeds: [infoEmbed.toJSON()]
            })
        }
        catch (error) {
            console.log(logSymbols.error, `Info Command: ${error}`.error)
            return locale.errors.command_failed
        }
    }
    async onUnload() {
        return 'okay'
    }
}