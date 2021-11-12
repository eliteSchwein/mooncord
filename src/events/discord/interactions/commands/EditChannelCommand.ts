import {CommandInteraction, TextChannel} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {removeFromArray} from "../../../../helper/DataHelper";

export class EditChannelCommand {
    protected databaseUtil = getDatabase()
    protected broadcastList = this.databaseUtil.getDatabaseEntry('guilds')
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'editchannel') { return }

        let channelOption = interaction.options.getChannel(this.syntaxLocale.commands.editchannel.options.channel.name)
        const user = interaction.user
        let channel = interaction.channel

        if(channel === null) {
            void interaction.reply(this.locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        if(channel.type === 'DM') {
            void interaction.reply(this.locale.messages.errors.guild_only
                .replace(/\${username}/g, user.tag))
            return
        }

        if(channelOption !== null) {
            if(channelOption.type !== 'GUILD_TEXT') {
                void interaction.reply(this.locale.messages.errors.not_textchannel
                    .replace(/\${username}/g, user.tag)
                    .replace(/\${channel}/g, channelOption.name))
                return
            }
            channel = channelOption as TextChannel
        }

        if(!Object.keys(this.broadcastList).includes(interaction.guildId)) {
            this.broadcastList[interaction.guildId] = {
                'broadcast_channels': []
            }
            this.databaseUtil.updateDatabaseEntry('guilds', this.broadcastList)
        }

        const broadcastChannels = this.broadcastList[interaction.guildId].broadcast_channels

        let answer

        if(broadcastChannels.includes(channel.id)) {
            removeFromArray(broadcastChannels, channel.id)
            answer = this.locale.messages.answers.broadcast_channel.deactivated
        } else {
            broadcastChannels.push(channel.id)
            answer = this.locale.messages.answers.broadcast_channel.activated
        }

        this.broadcastList[interaction.guildId].broadcast_channels = broadcastChannels

        answer = answer
            .replace(/\${username}/g, user.tag)
            .replace(/\${channel}/g, channel.name)

        this.databaseUtil.updateDatabaseEntry('guilds', this.broadcastList)
        
        void interaction.reply(answer)
    }
}