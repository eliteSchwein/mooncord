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
        }
    }
}

function getAbortEmbed(currentMessage, user) {
    console.log(currentMessage.attachments)
    const thumbnail = currentMessage.attachments[0]
    const currentEmbed = currentMessage.embeds[0]
    const abortMessage = commandlocale.answer.abort.replace(/(\${username})/g, user.username)
    const abortEmbed = new Discord.MessageEmbed()
        .setColor('#c90000')
        .setTitle(abortMessage)
        .setAuthor(currentEmbed.author)
        .setThumbnail(`attachment://${thumbnail.name}`)
    return abortEmbed
}