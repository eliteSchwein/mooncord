const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const discordClient = require('../../clients/discordclient')
const database = require('../../utils/databaseUtil')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.admin

module.exports = class AdminCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Admin Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description,
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: commandlocale.options.role.name,
                description: commandlocale.options.role.description,
                options: [{
                    type: CommandOptionType.ROLE,
                    name: commandlocale.options.role.options.role.name,
                    description: commandlocale.options.role.options.role.description,
                    required: true
                }]
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: commandlocale.options.user.name,
                description: commandlocale.options.user.description,
                options: [{
                    type: CommandOptionType.USER,
                    name: commandlocale.options.user.options.user.name,
                    description: commandlocale.options.user.options.user.description,
                    required: true
                }]
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (typeof (ctx.guildID) === 'undefined') {
            return locale.getGuildOnlyError(ctx.user.username)
        }
        
        if (!permission.hasController(ctx.user)) {
            return locale.getControllerOnlyError(ctx.user.username)
        }

        let isRole
        let adminid

        if (ctx.subcommands[0] === commandlocale.options.role.name) {
            isRole = true
            adminid = ctx.options[commandlocale.options.role.name][commandlocale.options.role.options.role.name]
        }

        if (ctx.subcommands[0] === commandlocale.options.user.name) {
            isRole = false
            adminid = ctx.options[commandlocale.options.user.name][commandlocale.options.user.options.user.name]
        }

        const result = await editAdmin(isRole, adminid, ctx.guildID)

        let answermention = `<@${adminid}>`

        if (isRole) {
            answermention = answermention.replace(/<@/g,'<@&')
        }

        if (result) {
            return commandlocale.answer.added
                .replace(/(\${username})/g, ctx.user.username)
                .replace(/(\${mention})/g, answermention)
        } 

        return commandlocale.answer.removed
            .replace(/(\${username})/g, ctx.user.username)
            .replace(/(\${mention})/g, answermention)
    }
    onError(error, ctx) {
        console.log(logSymbols.error, `Admin Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }
    onUnload() {
        return 'okay'
    }
}

async function editAdmin(isRole, adminid, guildid) {
    const guild = await discordClient.getClient().guilds.fetch(guildid)
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