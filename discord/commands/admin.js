const logSymbols = require('log-symbols')

const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.admin
const syntaxLocale = locale.syntaxlocale.commands.admin

module.exports.reply = async (interaction) => {
    try {
        console.log(interaction.guildId)
        if (typeof (interaction.guildId) === 'undefined') {
            await interaction.reply(locale.getGuildOnlyError(interaction.user.username))
            return
        }
        
        if (!permission.hasController(interaction.user)) {
            await interaction.reply(locale.getControllerOnlyError(interaction.user.username))
            return
        }

        let isRole
        let adminid

        if (interaction.options.getSubcommand() === syntaxLocale.options.role.name) {
            isRole = true
            adminid = interaction.options.getRole(syntaxLocale.options.role.options.role.name).id
        }

        if (interaction.options.getSubcommand() === syntaxLocale.options.user.name) {
            isRole = false
            adminid = interaction.options.getUser(syntaxLocale.options.user.options.user.name).id
        }

        const result = await editAdmin(isRole, adminid, interaction.guildId, interaction.client)

        let answermention = `<@${adminid}>`

        if (isRole) {
            answermention = answermention.replace(/<@/g,'<@&')
        }

        if (result) {
            await interaction.reply(messageLocale.answer.added
                .replace(/(\${username})/g, interaction.user.username)
                .replace(/(\${mention})/g, answermention))
            return
        } 

        await interaction.reply(messageLocale.answer.removed
            .replace(/(\${username})/g, interaction.user.username)
            .replace(/(\${mention})/g, answermention))
        
    } catch (error) {
        console.log(logSymbols.error, `Admin Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}

async function editAdmin(isRole, adminid, guildid, discordClient) {
    const guild = await discordClient.guilds.fetch(guildid)
    const guilddatabase = database.getGuildDatabase(guild)
    let adminarray = 'adminusers'

    if (isRole) {
        adminarray = 'adminroles'
    }

    if (guilddatabase[adminarray].includes(adminid)) {
        const index = guilddatabase[adminarray].indexOf(adminid)
        if (index > -1) {
            guilddatabase[adminarray].splice(index, 1)
        }
        database.updateDatabase(guilddatabase, guild)
        return false
    }

    guilddatabase[adminarray].push(adminid)
    database.updateDatabase(guilddatabase, guild)

    return true
}