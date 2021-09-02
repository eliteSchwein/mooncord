const moonrakerClient = require('../../clients/moonrakerClient')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const statusUtil = require('../../utils/statusUtil')
const metaData = require('../buttons-metadata/print_job.json')

const messageLocale = locale.commands.printjob

module.exports = async (button) => {
    const {message, user, customId, guildId, client, channel} = button

    if (!Object.keys(metaData).includes(customId)) { return }

    if (!await permission.hasAdmin(user, guildId, client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }

    const currentStatus = statusUtil.getStatus()
    const buttonMeta = metaData[customId]
    const langButtonMeta = messageLocale.answer[customId.replace('printjob_','')]

    if (customId === 'printjob_refresh') {
        await button.update({components: []})

        const updateMessage = await statusUtil.getManualStatusEmbed(channel, client)
        channel.send(updateMessage)
        return
    }

    if (customId === `printjob_${currentStatus}`) {
        await button.reply(langButtonMeta.status_same.replace(/(\${username})/g, user.username))
        return
    }

    if (!buttonMeta.required_status.includes(currentStatus)) {
        await button.reply(langButtonMeta.status_not_valid.replace(/(\${username})/g, user.username))
        return
    }

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${buttonMeta.macro}"}, "id": ${id}}`)

    await button.update({components: []})
}