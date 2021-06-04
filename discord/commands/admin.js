const { SlashCommand, CommandOptionType } = require('slash-create')

const discordClient = require('../../clients/discordclient')
const database = require('../../utils/databaseUtil')
const permission = require('../../utils/permissionUtil')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'admin',
            description: 'Manage Admin Role or User.',
            options: [{
                type: CommandOptionType.SUB_COMMAND,
                name: 'role',
                description: 'Modify Role',
                options: [{
                    type: CommandOptionType.ROLE,
                    name: 'role',
                    description: 'Select a Role.',
                    required: true
                }]
            },{
                type: CommandOptionType.SUB_COMMAND,
                name: 'user',
                description: 'Modify User',
                options: [{
                    type: CommandOptionType.USER,
                    name: 'user',
                    description: 'Select a User.',
                    required: true
                }]
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            if (typeof (ctx.guildID) === 'undefined') {
                return `This Command is only aviable on a Guild, ${ctx.user.username}!`
            }
            
            if (!permission.isMaster(ctx.user)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }

            let isRole
            let adminid

            if (ctx.subcommands[0] === 'role') {
                isRole = true
                adminid = ctx.options.role.role
            }

            if (ctx.subcommands[0] === 'user') {
                isRole = false
                adminid = ctx.options.user.user
            }

            const result = await editAdmin(isRole, adminid, ctx.guildID)

            let answermention = `<@${adminid}>`

            if (isRole) {
                answermention = answermention.replace(/<@/g,'<@&')
            }

            if (result) {
                return `${answermention} is now a Admin, ${ctx.user.username}!`
            } 
                return `${answermention} is not longer a Admin, ${ctx.user.username}!`
            
        }
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
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