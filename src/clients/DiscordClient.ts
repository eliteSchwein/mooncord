import {waitUntil} from 'async-wait-until'

import { Client, Intents } from 'discord.js'

import {getDatabase, getMoonrakerClient} from '../Application'
import {ConfigHelper} from '../helper/ConfigHelper'
import {logEmpty, logRegular, logSuccess} from '../helper/ConsoleLogger'
import {getEntry, setData} from '../utils/CacheUtil'

export class DiscordClient {
    protected config = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected database = getDatabase()

    public constructor() {
        this.connect()
    }

    private async connect() {
        await waitUntil(() => this.database.isReady(), { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 500 })

        logEmpty()
        logSuccess('Load Discord Client...')

        console.log(new Client({intents: [Intents.FLAGS.GUILDS]}))

        //const discordClient = new Discord.Client({intents: []})

        logRegular('Connect to Discord...')

        //await discordClient.login(this.config.getDiscordToken())

       // setData('invite_url', `https://discord.com/oauth2/authorize?client_id=${discordClient.user.id}&permissions=3422944320&scope=bot%20applications.commands`)

        //logSuccess(`  ${'Discordbot Connected'}
    //${'Name:'.gray} ${(discordClient.user.tag).green}
    //${'Invite:'.gray} ${getEntry('invite_url')}`.green)

    }

    public isConnected() {
     //   return discordClient.isReady()
    }

    public getClient() {
    //    return discordClient
    }
}