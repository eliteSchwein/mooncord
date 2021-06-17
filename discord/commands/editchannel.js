const { SlashCommand, CommandOptionType } = require('slash-create')
const logSymbols = require('log-symbols')

const discordClient = require('../../clients/discordclient')
const database = require('../../utils/databaseUtil')
const permission = require('../../utils/permissionUtil')
const locale = require('../../utils/localeUtil')

const commandlocale = locale.commands.editchannel

module.exports = class EditChannelCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Edit Channel Command'.commandload)
        super(creator, {
            name: commandlocale.command,
            description: commandlocale.description,
            options: [{
                type: CommandOptionType.CHANNEL,
                name: commandlocale.options.channel.name,
                description: commandlocale.options.channel.description,
                required: false
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            if (typeof (ctx.guildID) === 'undefined') {
                return locale.errors.guild_only.replace(/(\${username})/g, ctx.user.username)
            }

            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return locale.errors.admin_only.replace(/(\${username})/g, ctx.user.username)
            }

            let channel
            let channelresult

            if (typeof (ctx.options[commandlocale.options.channel.name]) === 'undefined') {
                channelresult = await editChannel(ctx.channelID, ctx.guildID)
                channel = `<#${ctx.channelID}>`
            } else {
                channelresult = await editChannel(ctx.options.channel, ctx.guildID)
                channel = `<#${ctx.options[commandlocale.options.channel.name]}>`
            }

            if (typeof (channelresult) === 'undefined') {
                return commandlocale.answer.not_textchannel
                    .replace(/(\${username})/g, ctx.user.username)
                    .replace(/(\${channel})/g, channel)
            }

            if (channelresult) {
                return commandlocale.answer.activated
                    .replace(/(\${username})/g, ctx.user.username)
                    .replace(/(\${channel})/g, channel)
            } 
            return commandlocale.answer.deactivated
                .replace(/(\${username})/g, ctx.user.username)
                .replace(/(\${channel})/g, channel)
            
        }
        catch (error) {
            console.log(logSymbols.error, `Channel Command: ${error}`.error)
            return locale.errors.command_failed
        }
    }
    async onUnload() {
        return 'okay'
    }
}
async function editChannel(channelid, guildid) {
    const guild = await discordClient.getClient().guilds.fetch(guildid)
    const channel = await discordClient.getClient().channels.fetch(channelid)
    const guilddatabase = database.getGuildDatabase(guild)

    if (channel.type !== 'text') {
        return
    }
    if (guilddatabase.broadcastchannels.includes(channelid)) {
        const index = guilddatabase.broadcastchannels.indexOf(channelid)
        if (index > -1) {
            guilddatabase.broadcastchannels.splice(index, 1)
        }
        database.updateDatabase(guilddatabase, guild)
        return false
    }

    guilddatabase.broadcastchannels.push(channelid)
    database.updateDatabase(guilddatabase, guild)

    return true
}