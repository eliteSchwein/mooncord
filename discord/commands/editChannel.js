const logSymbols = require('log-symbols')
const { SlashCommand, CommandOptionType } = require('slash-create')

const discordClient = require('../../clients/discordClient')
const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.editchannel
const syntaxLocale = locale.syntaxlocale.commands.editchannel

module.exports = class EditChannelCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Edit Channel Command'.commandload)
        super(creator, {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: [{
                type: CommandOptionType.CHANNEL,
                name: syntaxLocale.options.channel.name,
                description: messageLocale.options.channel.description,
                required: false
            }]
        })
        this.filePath = __filename
    }

    async run(ctx) {
        if (typeof (ctx.guildID) === 'undefined') {
            return locale.getGuildOnlyError(ctx.user.username)
        }

        if (!await permission.hasAdmin(ctx.user, ctx.guildID, discordClient.getClient())) {
            return locale.getAdminOnlyError(ctx.user.username)
        }

        let channel
        let channelresult

        if (typeof (ctx.options[syntaxLocale.options.channel.name]) === 'undefined') {
            channelresult = await editChannel(ctx.channelID, ctx.guildID)
            channel = `<#${ctx.channelID}>`
        } else {
            channelresult = await editChannel(ctx.options.channel, ctx.guildID)
            channel = `<#${ctx.options[syntaxLocale.options.channel.name]}>`
        }

        if (typeof (channelresult) === 'undefined') {
            return messageLocale.answer.not_textchannel
                .replace(/(\${username})/g, ctx.user.username)
                .replace(/(\${channel})/g, channel)
        }

        if (channelresult) {
            return messageLocale.answer.activated
                .replace(/(\${username})/g, ctx.user.username)
                .replace(/(\${channel})/g, channel)
        } 
        return messageLocale.answer.deactivated
            .replace(/(\${username})/g, ctx.user.username)
            .replace(/(\${channel})/g, channel)
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Channel Command: ${error}`.error)
        ctx.send(locale.errors.command_failed)
    }

    onUnload() {
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
