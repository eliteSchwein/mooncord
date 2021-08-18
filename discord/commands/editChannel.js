const logSymbols = require('log-symbols')
const { SlashCommandBuilder } = require('@discordjs/builders')

const database = require('../../utils/databaseUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const messageLocale = locale.commands.editchannel
const syntaxLocale = locale.syntaxlocale.commands.editchannel

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
        .addChannelOption(channelOption =>
            channelOption.setName(syntaxLocale.options.channel.name)
                .setDescription(messageLocale.options.channel.description)
                .setRequired(false))
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (typeof(interaction.guildId) === 'undefined') {
            await interaction.reply(locale.getGuildOnlyError(interaction.user.username))
            return
        }
        if (!await permission.hasAdmin(interaction.user, interaction.guildId, interaction.client)) {
            await interaction.reply(locale.getAdminOnlyError(interaction.user.username))
            return
        }

        let channel
        let channelresult

        if (interaction.options.getChannel(syntaxLocale.options.channel.name) === null) {
            channelresult = await editChannel(interaction.channelId,
                interaction.guildId,
                interaction.client)
            channel = `<#${interaction.channelId}>`
        } else {
            channelresult = await editChannel(
                interaction.options.getChannel(syntaxLocale.options.channel.name).id,
                interaction.guildId,
                interaction.client)
            channel = `<#${interaction.options.getChannel(syntaxLocale.options.channel.name).id}>`
        }

        if (typeof (channelresult) === 'undefined') {
            await interaction.reply(messageLocale.answer.not_textchannel
                .replace(/(\${username})/g, interaction.user.username)
                .replace(/(\${channel})/g, channel))
                return
        }

        if (channelresult) {
            await interaction.reply(messageLocale.answer.activated
                .replace(/(\${username})/g, interaction.user.username)
                .replace(/(\${channel})/g, channel))
                return
        } 
        await interaction.reply(messageLocale.answer.deactivated
            .replace(/(\${username})/g, interaction.user.username)
            .replace(/(\${channel})/g, channel))
            return
    } catch (error) {
        console.log(logSymbols.error, `Edit Channel Command: ${error}`.error)
        await interaction.reply(locale.errors.command_failed)
    }
}
async function editChannel(channelid, guildid, discordClient) {
    const guild = await discordClient.guilds.fetch(guildid)
    const channel = await discordClient.channels.fetch(channelid)
    const guilddatabase = database.getGuildDatabase(guild)

    console.log(channel)

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