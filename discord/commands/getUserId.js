const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const metadata = require('../commands-metadata/get_log.json')

const messageLocale = locale.commands.get_user_id
const syntaxLocale = locale.syntaxlocale.commands.get_user_id

module.exports.reply = async (interaction) => {
    if (interaction.options.getUser(syntaxLocale.options.user.name) === null) {
        await interaction.reply(messageLocale.answer.own_id
            .replace(/(\${id})/g, interaction.user.id))
        return
    }

    const user = interaction.options.getUser(syntaxLocale.options.user.name)
    await interaction.reply(messageLocale.answer.other_id
        .replace(/(\${id})/g, user.id)
        .replace(/(\${username})/g, user.username))
}