const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')
const statusUtil = require('../../utils/statusUtil')
const moonrakerClient = require('../../clients/moonrakerClient')

const metaData = require('../buttons-metadata/print_job.json')

const messageLocale = locale.commands.printjob

module.exports = async (button) => {
    const message = button.message
    const user = button.user

    if (message.author.id !== button.client.user.id) { return }
    if (!Object.keys(metaData).includes(button.customId)) { return }

    let guildID = button.guildId

    if (!await permission.hasAdmin(user, guildID, button.client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }

    const currentStatus = statusUtil.getStatus()
    const buttonMeta = metaData[button.customId]
    const langButtonMeta = messageLocale.answer[button.customId.replace('printjob_','')]

    if (button.customId === 'printjob_refresh') {
        await button.update({components: []})

        const updateMessage = statusUtil.getManualStatusEmbed(button.channel, button.client)
        button.channel.send(updateMessage)
        return
    }

    if (button.id === `printjob_${currentStatus}`) {
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