const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
const Discord = require('discord.js')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.printjob

module.exports = async (button, discordClient) => {
    const message = button.message
    const user = button.clicker.user

    if (message.author.id !== discordClient.user.id) { return }

    let guildID

    if(typeof(button.guild) !== 'undefined') { guildID = button.guild.id }

    if (!await permission.hasAdmin(user, guildID, discordClient)) {
        button.reply.send(message.channel.send(locale.getAdminOnlyError(user.username)))
    }
    switch (button.id) {
        case ("printjob_start_no"): {
            await message.edit({ embed: getAbortEmbed(message, user), components: null })
            return
        }
        case ("printjob_start_yes"): {
            await message.edit({ embed: getStartEmbed(message, user), components: null })
            //startPrint(message)
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