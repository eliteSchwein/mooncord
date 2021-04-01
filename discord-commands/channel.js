const { SlashCommand, CommandOptionType } = require('slash-create');
const database = require('../utils/databaseUtil')
const permission = require('../utils/permissionUtil')
const discordClient = require('../clients/discordclient')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'editchannel',
            description: 'Add or Remove broadcast channel.',
            options: [{
                type: CommandOptionType.CHANNEL,
                name: 'channel',
                description: 'Select a Channel to add/remove it as Broadcast channel.',
                required: false
            }]
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        try {
            if (!await permission.hasAdmin(ctx.user, ctx.guildID)) {
                return `You dont have the Permissions, ${ctx.user.username}!`
            }

            let channel
            let channelresult

            if (typeof (ctx.options.channel) === 'undefined') {
                channelresult = await editChannel(ctx.channelID, ctx.guildID)
                channel = 'This Channel'
            } else {
                channelresult = await editChannel(ctx.options.channel, ctx.guildID)
                channel = `<#${ctx.options.channel}>`
            }

            if (typeof (channelresult) === 'undefined') {
                return `${channel} is not a Text Channel, ${ctx.user.username}!`
            }

            if (channelresult) {
                return `${channel} is now a Broadcast Channel, ${ctx.user.username}!`
            } else {
                return `${channel} is not longer a Broadcast Channel, ${ctx.user.username}!`
            }
        }
        catch (err) {
            console.log(err)
            return "An Error occured!";
        }
    }
}
async function editChannel(channelid, guildid) {
    const guild = await discordClient.getClient().guilds.fetch(guildid)
    const channel = await discordClient.getClient().channels.fetch(channelid)
    const guilddatabase = database.getGuildDatabase(guild)

    if (channel.type !== 'text') {
        return undefined
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