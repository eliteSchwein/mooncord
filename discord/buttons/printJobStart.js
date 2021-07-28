const moonrakerClient = require('../../clients/moonrakerClient')
const permission = require('../../utils/permissionUtil')
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
            const abortMessage = commandlocale.answer.abort.replace(/(\${username})/g, user.username)
            await message.edit({ abortMessage, buttons: undefined })
            await message.suppressEmbeds(true)
        }
    }
}