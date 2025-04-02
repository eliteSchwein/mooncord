'use strict'

import {Client} from "discord.js";
import {updateData} from "../../utils/CacheUtil";
import {getDiscordClient} from "../../Application";

export class DebugHandler {
    public constructor(discordClient: Client) {
        discordClient.on("debug", info => {
            if (info.includes('Heartbeat acknowledged, latency of')) {
                updateData('discord_client', {
                    'event_count': getDiscordClient().getClient()['_eventsCount']
                })
            }
        })
    }
}