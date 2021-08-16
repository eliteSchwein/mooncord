const args = process.argv.slice(2)

const axios = require('axios')
const logSymbols = require('log-symbols')
const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

const config = require(`${args[0]}/mooncord.json`)
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metadata = require('../commands-metadata/get_log.json')

const messageLocale = locale.commands.get_log
const syntaxLocale = locale.syntaxlocale.commands.get_log

module.exports.command = () => {
    console.log('  Load Get Log Command'.commandload)
    console.log(metadata.choices)
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
        .addStringOption(service =>
            service.setName(syntaxLocale.options.log_file.name)
            .setDescription(messageLocale.options.log_file.description)
            .setRequired(true)
            .addChoices(metadata.choices))
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (!permission.hasController(interaction.user)) {
            await interaction.reply(locale.getControllerOnlyError(interaction.user.username))
            return
        }

        const service = interaction.options.getString(syntaxLocale.options.log_file.name)

        await interaction.deferReply()

        axios.request({
            responseType: 'arraybuffer',
            url: `${config.connection.moonraker_url}${metadata.files[service]}`,
            method: 'get',
            headers: {
                'Content-Type': 'text/plain',
                'X-Api-Key': config.connection.moonraker_token,
            },
        }).then(async (result) => {
            let file = new Discord.MessageAttachment(result.data, `${service}.log`)
            await interaction.editReply({
                content: messageLocale.answer.retrieved
                    .replace(/(\${service})/g, `\`${service}\``),
                files: [file]
            })
        }).catch(async (error) => {
            await interaction.editReply(
                messageLocale.answer.not_found
                    .replace(/(\${service})/g, `\`${service}\``)) 
        });
    } catch (error) {
        console.log(logSymbols.error, `Get Log Command: ${error}`.error)
        await interaction.editReply(locale.errors.command_failed)
    }
}