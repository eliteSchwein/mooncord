const Discord = require('discord.js')
const logSymbols = require('log-symbols')
const path = require('path')
const { SlashCommandBuilder } = require('@discordjs/builders')

const locale = require('../../utils/localeUtil')

const messageLocale = locale.commands.info
const syntaxLocale = locale.syntaxlocale.commands.info

const pjson = require('../../package.json')

module.exports.command = () => {
    console.log('  Load Info Command'.commandload)
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        const description = messageLocale.embed.description
            .replace(/(\${version})/g, pjson.version)
            .replace(/(\${author})/g, pjson.author)
            .replace(/(\${homepage})/g, pjson.homepage)
    
        const logopath = path.resolve(__dirname, '../../images/logo.png')
        
        const icon = new Discord.MessageAttachment(logopath, 'logo.png')

        const infoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(messageLocale.embed.title)
            .setDescription(description)
            .setThumbnail('attachment://logo.png')

        await interaction.reply({
            embeds:[infoEmbed], 
            files:[icon] })
    } catch (error) {
        console.log(logSymbols.error, `Info Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}