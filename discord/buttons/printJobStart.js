const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const Discord = require('discord.js')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.printjob

module.exports = async (button) => {
    const message = button.message
    const user = button.user

    if (message.author.id !== button.client.user.id) { return }

    let guildID = button.guildId

    if (!await permission.hasAdmin(user, guildID, button.client)) {
        await button.reply(message.channel.send(locale.getAdminOnlyError(user.username)))
        return
    }
    switch (button.customId) {
        case ("printjob_start_no"): {
            await message.edit({ embeds: [getAbortEmbed(message, user)], components: null })
            return
        }
        case ("printjob_start_yes"): {
            await message.edit({ embeds: [getStartEmbed(message, user)], components: null })
            startPrint(message)
            return
        }
    }
}

function startPrint(currentMessage) {
    const currentEmbed = currentMessage.embeds[0]
    const gcodeFile = currentEmbed.author.name
    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

    connection.send(`{"jsonrpc": "2.0", "method": "printer.print.start", "params": {"filename": "${gcodeFile}"}, "id": ${id}}`)
}

function getAbortEmbed(currentMessage, user) {
    const currentEmbed = currentMessage.embeds[0]
    const abortMessage = commandlocale.answer.abort.replace(/(\${username})/g, user.username)
    const abortEmbed = new Discord.MessageEmbed()
        .setColor('#c90000')
        .setAuthor(currentEmbed.author.name, 'attachment://thumbnail.png')
        .setDescription(abortMessage)
    return abortEmbed
}

function getStartEmbed(currentMessage, user) {
    const currentEmbed = currentMessage.embeds[0]
    const startMessage = commandlocale.answer.executed.replace(/(\${username})/g, user.username)
    const startEmbed = new Discord.MessageEmbed()
        .setColor('#25db00')
        .setAuthor(currentEmbed.author.name, 'attachment://thumbnail.png')
        .setDescription(startMessage)
    return startEmbed
}