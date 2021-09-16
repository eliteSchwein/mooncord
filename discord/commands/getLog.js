const args = process.argv.slice(2)

const axios = require('axios')
const Discord = require('discord.js')
const logSymbols = require('log-symbols')



const configData = fs.readFileSync(`${args[0]}/mooncord.json`, {encoding: 'utf8'})
const config = JSON.parse(configData)
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metadata = require('../commands-metadata/get_log.json')

const messageLocale = locale.commands.get_log
const syntaxLocale = locale.syntaxlocale.commands.get_log

module.exports.reply = async (interaction) => {
    if (!permission.hasController(interaction.user)) {
        await interaction.reply(locale.getControllerOnlyError(interaction.user.username))
        return
    }

    const service = interaction.options.getString(syntaxLocale.options.log_file.name)

    await interaction.deferReply()

    try {
        const result = await axios.request({
            responseType: 'arraybuffer',
            url: `${config.connection.moonraker_url}${metadata.files[service]}`,
            method: 'get',
            headers: {
                'Content-Type': 'text/plain',
                'X-Api-Key': config.connection.moonraker_token,
            },
        })

        const bufferSize = Buffer.byteLength(result.data)

        if (bufferSize > Number.parseInt('8000000')) {
            await interaction.editReply({
                content: messageLocale.answer.too_large
                    .replace(/(\${service})/g, `\`${service}\``)
            })
            return
        }

        const file = new Discord.MessageAttachment(result.data, `${service}.log`)
        await interaction.editReply({
            content: messageLocale.answer.retrieved
                .replace(/(\${service})/g, `\`${service}\``),
            files: [file]
        })
    } catch {
        await interaction.editReply(
                messageLocale.answer.not_found
            .replace(/(\${service})/g, `\`${service}\``))
    }
}