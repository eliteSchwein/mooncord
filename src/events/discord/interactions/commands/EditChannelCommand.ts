import BaseCommand from "../abstracts/BaseCommand";
import {ChannelType, ChatInputCommandInteraction, TextChannel} from "discord.js";
import {removeFromArray} from "../../../../helper/DataHelper";

export default class EditChannelCommand extends BaseCommand {
    commandId = 'editchannel'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        const broadcastList = this.database.getDatabaseEntry('guilds')

        let channelOption = interaction.options.getChannel(this.syntaxLocale.commands.editchannel.options.channel.name)
        const user = interaction.user
        let channel = interaction.channel

        if (channel === null) {
            void interaction.reply(this.locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        // @ts-ignore
        if (channel.type === ChannelType.DM) {
            void interaction.reply(this.locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        if (channelOption !== null) {
            if (channelOption.type !== ChannelType.GuildText) {
                void interaction.reply(this.locale.messages.errors.not_textchannel
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
            await this.database.updateDatabaseEntry('guilds', broadcastList)
        }

        const broadcastChannels = broadcastList[interaction.guildId].broadcast_channels

        let answer

        if (broadcastChannels.includes(channel.id)) {
            removeFromArray(broadcastChannels, channel.id)
            answer = this.locale.messages.answers.broadcast_channel.deactivated
        } else {
            broadcastChannels.push(channel.id)
            answer = this.locale.messages.answers.broadcast_channel.activated
        }

        broadcastList[interaction.guildId].broadcast_channels = broadcastChannels

        answer = answer
            .replace(/\${username}/g, user.tag)
            .replace(/\${channel}/g, channel.name)

        await this.database.updateDatabaseEntry('guilds', broadcastList)

        void interaction.reply(answer)
    }
}