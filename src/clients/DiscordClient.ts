import {waitUntil} from 'async-wait-until'

import { Client, Intents } from 'discord.js'

import {getDatabase, getMoonrakerClient} from '../Application'
import {ConfigHelper} from '../helper/ConfigHelper'
import {logEmpty, logRegular, logSuccess} from '../helper/ConsoleLogger'
import {dump, getEntry, setData} from '../utils/CacheUtil'
import {DiscordCommandGenerator} from "../generator/DiscordCommandGenerator";

export class DiscordClient {
    protected config = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected database = getDatabase()
    protected commandGenerator = new DiscordCommandGenerator()
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

        setData('invite_url', `https://discord.com/oauth2/authorize?client_id=${this.discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`)
        
        logSuccess('Discordbot Connected')
        logSuccess(`${'Name:'.green  } ${  (this.discordClient.user.tag).white}`)
        logSuccess('Invite:'.green)
        console.log(getEntry('invite_url').cyan)
        dump()
    }

    private async registerCommands() {
        logRegular('Register Commands...')
        await this.discordClient.application?.commands.set(this.commandGenerator.getCommands())
    }

    public isConnected() {
        return this.discordClient.isReady()
    }

    public getClient() {
        return this.discordClient
    }
}