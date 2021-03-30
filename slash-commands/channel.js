const { SlashCommand, CommandOptionType } = require('slash-create');
const permissionUtil = require('../utils/permissionUtil')
const core = require('../mooncord')
const discordDatabase = require('../discorddatabase')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            guildIDs: '626717239210672139',
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
        if (!permissionUtil.hasAdmin(ctx.user, ctx.guildID)) {
            return `You dont have the Permissions, ${ctx.user.username}!`
        }

        let channel
        let channelresult

        if (typeof (ctx.options.channel) === 'undefined') {
            channelresult = editChannel(ctx.channelID, ctx.guildID)
            channel = 'This'
        } else {
            channelresult = editChannel(ctx.options.channel, ctx.guildID)
            const otherchannel = await core.getDiscordClient().channels.fetch(ctx.options.channel)
            channel = otherchannel.name
        }
        if (typeof (channelresult) === 'undefined') {
            return `${channel} is not a Text Channel, ${ctx.user.username}!`
        }

        if (channelresult) { return `${channel} is now a Broadcast Channel, ${ctx.user.username}!` }
        if (!channelresult) { return `${channel} is not longer a Broadcast Channel, ${ctx.user.username}!` }
    }
}
async function editChannel(channelid, guildid) {
    const guild = await core.getDiscordClient().guilds.fetch(guildid)
    const channel = await core.getDiscordClient().channels.fetch(channelid)
    const database = discordDatabase.getGuildDatabase(guild)

    if (channel.type !== 'text') {
        return undefined
    }
    console.log(database.statuschannels.includes(channelid))
    if (database.statuschannels.includes(channelid)) {
        const index = database.statuschannels.indexOf(channelid)
        if (index > -1) {
            database.statuschannels.splice(index, 1)
        }
        discordDatabase.updateDatabase(database, guild)
        return false
    }

    database.statuschannels.push(channelid)
    discordDatabase.updateDatabase(database, guild)

    return true
}