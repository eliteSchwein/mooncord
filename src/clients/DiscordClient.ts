import {waitUntil} from 'async-wait-until'

import {Client, Intents} from 'discord.js'

import {getDatabase} from '../Application'
import {ConfigHelper} from '../helper/ConfigHelper'
import {logEmpty, logRegular, logSuccess} from '../helper/LoggerHelper'
import {dump, getEntry, setData} from '../utils/CacheUtil'
import {DiscordCommandGenerator} from "../generator/DiscordCommandGenerator";
import {DiscordInputGenerator} from '../generator/DiscordInputGenerator'
import {InteractionHandler} from "../events/discord/InteractionHandler";
import {DebugHandler} from "../events/discord/DebugHandler";
import {ActivityTypes} from "discord.js/typings/enums";
import {DiscordStatusGenerator} from "../generator/DiscordStatusGenerator";
import {LocaleHelper} from "../helper/LocaleHelper";

let interactionHandler: InteractionHandler
let debugHandler: DebugHandler

export class DiscordClient {
    protected config = new ConfigHelper()
    protected database = getDatabase()
    protected commandGenerator = new DiscordCommandGenerator()
    protected inputGenerator = new DiscordInputGenerator()
    protected statusGenerator = new DiscordStatusGenerator()
    protected localeHelper = new LocaleHelper()
    protected discordClient: Client

    public constructor() {
        this.connect()
    }

    private async connect() {
        await waitUntil(() => this.database.isReady(), { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 500 })

        logEmpty()
        logSuccess('Load Discord Client...')

        this.discordClient = new Client({intents: [
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_INTEGRATIONS
            ]})

        logRegular('Connect to Discord...')

        await this.discordClient.login(this.config.getDiscordToken())

        await this.registerCommands()

        await this.registerEvents()

        this.generateCaches()

        setData('invite_url', `https://discord.com/oauth2/authorize?client_id=${this.discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`)
        setData('discord_client', {
            'readySince': new Date(),
            'applicationId': this.discordClient.application.id,
            'clientId': this.discordClient.user.id,
            'ping': this.discordClient.ws.ping,
            'event_count': this.discordClient['_eventsCount']
        })
        
        logSuccess('Discordbot Connected')
        logSuccess(`${'Name:'.green  } ${  (this.discordClient.user.tag).white}`)
        logSuccess('Invite:'.green)
        console.log(getEntry('invite_url').cyan)

        this.discordClient.user.setPresence({status: "idle"})

        this.discordClient.user.setActivity(
            this.localeHelper.getLocale().embeds.ready.activity,
            {type: ActivityTypes.LISTENING}
        )

        if(this.config.dumpCacheOnStart()) {
            await dump()
            await this.database.dump()
        }
    }

    private async registerCommands() {
        logRegular('Register Commands...')
        await this.discordClient.application?.commands.set(this.commandGenerator.getCommands())
    }

    private async registerEvents() {
        logRegular('Register Events...')
        interactionHandler = new InteractionHandler(this.discordClient)
        debugHandler = new DebugHandler(this.discordClient)
    }

    private generateCaches() {
        logRegular('Generate Caches...')
        this.inputGenerator.generateInputCache()
        this.statusGenerator.generateStatusCache()
    }

    public isConnected() {
        return this.discordClient.isReady()
    }

    public getClient() {
        return this.discordClient
    }
}