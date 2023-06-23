'use strict'

import {CommandInteraction, TextChannel} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {removeFromArray} from "../../../../helper/DataHelper";

export class EditChannelCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'editchannel') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const databaseUtil = getDatabase()
        const broadcastList = databaseUtil.getDatabaseEntry('guilds')
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()

        let channelOption = interaction.options.getChannel(syntaxLocale.commands.editchannel.options.channel.name)
        const user = interaction.user
        let channel = interaction.channel

        if (channel === null) {
            void interaction.reply(locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        // @ts-ignore
        if (channel.type === 'DM') {
            void interaction.reply(locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        if (channelOption !== null) {
            if (channelOption.type !== 'GUILD_TEXT') {
                void interaction.reply(locale.messages.errors.not_textchannel
                    .replace(/\${username}/g, user.tag)
                    .replace(/\${channel}/g, channelOption.name))
                return
            }
            channel = channelOption as TextChannel
        }

        if (!Object.keys(broadcastList).includes(interaction.guildId)) {
            broadcastList[interaction.guildId] = {
                'broadcast_channels': []
            }
            await databaseUtil.updateDatabaseEntry('guilds', broadcastList)
        }

        const broadcastChannels = broadcastList[interaction.guildId].broadcast_channels

        let answer

        if (broadcastChannels.includes(channel.id)) {
            removeFromArray(broadcastChannels, channel.id)
            answer = locale.messages.answers.broadcast_channel.deactivated
        } else {
            broadcastChannels.push(channel.id)
            answer = locale.messages.answers.broadcast_channel.activated
        }

        broadcastList[interaction.guildId].broadcast_channels = broadcastChannels

        answer = answer
            .replace(/\${username}/g, user.tag)
            .replace(/\${channel}/g, channel.name)

        await databaseUtil.updateDatabaseEntry('guilds', broadcastList)

        void interaction.reply(answer)
    }
}