'use strict'

import {TextChannel} from "discord.js"
import * as app from "../Application"
import {DiscordClient} from "../clients/DiscordClient"
import {LocaleHelper} from "./LocaleHelper"
import {logWarn} from "./LoggerHelper";
import {ConfigHelper} from "./ConfigHelper";
import {getEntry} from "../utils/CacheUtil";

export class NotificationHelper {
    protected databaseUtil = app.getDatabase()
    protected configHelper = new ConfigHelper()
    protected broadcastList = {}
    protected notifyList = []
    protected discordClient: DiscordClient
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async broadcastMessage(message) {
        if (!this.getEntries()) {
            return
        }

        await this.broadcastGuilds(message)
        await this.notifyUsers(message)
    }

    public async removeOldStatus(channel: TextChannel) {
        if (typeof channel.messages === 'undefined') {
            return
        }

        const messages = await channel.messages.fetch({limit: 1})
        const lastMessage = messages.first()
        const validTitles = [
            this.locale.embeds.printjob_printing.title,
            this.locale.embeds.notification.title
        ]

        if (typeof this.locale === 'undefined') return
        if (lastMessage.author.id !== getEntry("discord_client").clientId) return
        if (lastMessage.embeds.length === 0) return

        const embed = lastMessage.embeds[0]

        if (!embed) return

        console.log(validTitles.includes(embed.title))
        console.log(validTitles.includes(embed.data))

        if (
            validTitles.includes(embed.title) ||
            validTitles.includes(embed.data.title)
        ) {
            try {
                await lastMessage.delete()
            } catch (error) {
                logWarn('deleting old message failed:')
                logWarn(JSON.stringify(error, Object.getOwnPropertyNames(error)))
            }
        }
    }

    public isEmbedBlocked(embedId: string) {
        const blacklist = this.configHelper.getEntriesByFilter(/^notifications/g)[0].embed_blacklist

        if (blacklist === undefined) {
            return false
        }

        return blacklist.includes(embedId)
    }

    protected getEntries() {
        if (!this.databaseUtil.isReady()) {
            return false
        }

        this.discordClient = app.getDiscordClient()
        this.broadcastList = this.databaseUtil.getDatabaseEntry('guilds')
        this.notifyList = this.databaseUtil.getDatabaseEntry('notify')

        return true
    }

    private async notifyUsers(message) {
        if (this.discordClient === null) {
            return
        }
        for (const userId of this.notifyList) {
            const user = await this.discordClient.getClient().users.fetch(userId)

            const channel = user.dmChannel

            if (channel === null) {
                await user.send(message)
                return
            }

            await this.broadcastChannels([user.dmChannel], message)
        }
    }

    private async broadcastGuilds(message) {
        for (const guildId in this.broadcastList) {
            const guildMeta = this.broadcastList[guildId]
            try {
                const guild = await this.discordClient.getClient().guilds.fetch(guildId)

                const channels = guild.channels.cache.filter(
                    (channel) => {
                        return guildMeta.broadcast_channels.includes(channel.id)
                    })

                await this.broadcastChannels(channels, message)
            } catch (error) {
                logWarn(`Delete Data for the Guild with the ID: ${guildId} because Bot isnt on this Guild anymore`)
                const guildData = this.databaseUtil.getDatabaseEntry('guilds')

                delete guildData[guildId]

                this.databaseUtil.updateDatabaseEntry('guilds', guildData)
            }
        }
    }

    private async broadcastChannels(channels, message) {
        for (let channel of channels) {
            if (channel.constructor.name === 'Array') {
                channel = channel[1]
            }
            await this.removeOldStatus(channel)

            await channel.send(message)
        }
    }
}