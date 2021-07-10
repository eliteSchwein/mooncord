const args = process.argv.slice(2)

const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')
const axios = require('axios')
const fs = require('fs')

const config = require(`${args[0]}/mooncord.json`)
const discordClient = require('../../clients/discordClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metadata = require('../commands-metadata/get_log.json')

const messageLocale = locale.commands.get_log
const syntaxLocale = locale.syntaxlocale.commands.get_log

module.exports = class EditChannelCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Get Log Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                choices: metadata.choices,
                type: CommandOptionType.STRING,
                name: syntaxLocale.options.log_file.name,
                description: messageLocale.options.log_file.description,
                required: true
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (!await permission.hasController(ctx.user, ctx.guildID, discordClient.getClient())) {
            return locale.getControllerOnlyError(ctx.user.username)
        }

        const service = ctx.options[syntaxLocale.options.log_file.name]

        ctx.defer(false)

        const logFile = await getLog(service)

        await ctx.send({
            content: messageLocale.answer.retrieved
                .replace(/(\${service})/g, `\`${service}\``),
            file: {
                name: `${service}.log`,
                file: logFile
            }
        })
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Get Log  Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }

    onUnload() {
        return 'okay'
    }
}

async function getLog(servicename) {
    const buffer = await axios.request({
        responseType: 'arraybuffer',
        url: `${config.connection.moonraker_url}${metadata.files[servicename]}`,
        method: 'get',
        headers: {
            'Content-Type': 'text/plain',
        },
    })
    console.log(buffer.data)
    return buffer.data
}