const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')
const statusUtil = require('../../utils/statusUtil')
const moonrakerClient = require('../../clients/moonrakerClient')

const metaData = require('../buttons-metadata/print_job.json')

const messageLocale = locale.commands.printjob

module.exports = async (button, discordClient) => {
    const message = button.message
    const user = button.clicker.user

    if (message.author.id !== discordClient.user.id) { return }
    if (!Object.keys(metaData).includes(button.id)) { return }
    if (!await permission.hasAdmin(user, button.guild.id, discordClient)) {
        button.reply.send(message.channel.send(locale.getAdminOnlyError(user.username)))
    }

    const currentStatus = statusUtil.getStatus()
    const buttonMeta = metaData[key]
    const langCommandMeta = messageLocale.answer[key]

    if (subcommand === currentStatus) {
        button.reply.send(langCommandMeta.status_same.replace(/(\${username})/g, user.username))
    }

    if (!buttonMeta.requiredStatus.includes(currentStatus)) {
        button.reply.send(langCommandMeta.status_not_valid.replace(/(\${username})/g, user.username))
    }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${buttonMeta.macro}"}, "id": ${id}}`)
}