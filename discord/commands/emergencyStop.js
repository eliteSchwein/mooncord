const logSymbols = require('log-symbols')
const { SlashCommand } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.emergency_stop
const syntaxLocale = locale.syntaxlocale.commands.emergency_stop

let connection

module.exports.command = {
    name: syntaxLocale.command,
    description: messageLocale.description
}