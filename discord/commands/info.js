const Discord = require('discord.js')
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')
const { SlashCommand } = require('slash-create')

const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.info
const syntaxLocale = locale.syntaxlocale.commands.info

const pjson = require('../../package.json')

module.exports = class InfoCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Info Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description
        })
        this.filePath = __filename
    }

    async run(ctx) {
        const description = messageLocale.embed.description
            .replace(/(\${version})/g, pjson.version)
            .replace(/(\${author})/g, pjson.author)
            .replace(/(\${homepage})/g, pjson.homepage)
    
        const logopath = path.resolve(__dirname, '../../images/logo.png')

        const logobuffer = fs.readFileSync(logopath)

        const infoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(messageLocale.embed.title)
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

    onError(error, ctx) {
        console.log(logSymbols.error, `Info Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }

    onUnload() {
        return 'okay'
    }
}