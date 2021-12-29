import * as packageConfig from '../package.json'
import * as util from 'util'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {hookProcess, logEmpty, logError, logRegular, logSuccess, tempHookLog} from './helper/LoggerHelper'
import {DatabaseUtil} from './utils/DatabaseUtil'
import {LocaleHelper} from "./helper/LocaleHelper";
import { setData } from './utils/CacheUtil'
import {ConfigHelper} from "./helper/ConfigHelper";
import {EmbedHelper} from "./helper/EmbedHelper";
import {SchedulerHelper} from "./helper/SchedulerHelper";
import {StatusHelper} from "./helper/StatusHelper";
import {waitUntil} from "async-wait-until";

Object.assign(global, { WebSocket: require('ws') })

tempHookLog()
hookProcess()

logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)

const configHelper = new ConfigHelper()
configHelper.loadCache()

const localeHelper = new LocaleHelper()
const embedHelper = new EmbedHelper()

const moonrakerClient = new MoonrakerClient()
const database = new DatabaseUtil()
const discordClient = new DiscordClient()

const schedulerHelper = new SchedulerHelper()
const statusHelper = new StatusHelper()

void init()

async function init() {
    initCache()

    logEmpty()

    let currentInitState = 'Moonraker Client'

    try {
        await moonrakerClient.connect()
        await waitUntil(() => moonrakerClient.isReady(), { timeout: 10_000, intervalBetweenAttempts: 500 })

        currentInitState = 'Database'
        await database.retrieveDatabase()
        await waitUntil(() => database.isReady(), { timeout: 10_000, intervalBetweenAttempts: 500 })
        
        currentInitState = 'Discord Client'
        await discordClient.connect()
        await waitUntil(() => discordClient.isConnected(), { timeout: 10_000, intervalBetweenAttempts: 500 })
    } catch (error) {
        logError(`couldn't load ${currentInitState} in Time! Reason: ${util.format(error)}`)
    }

    logRegular('Register Scheduler...')

    schedulerHelper.init(moonrakerClient)

    await statusHelper.update('ready', discordClient)
}

export async function restartBot() {
    logEmpty()
    logSuccess('restart Bot...')

    schedulerHelper.clear()
    moonrakerClient.close()

    await init()
}

function initCache() {
    logRegular('load Package Cache...')
    setData('package_config', packageConfig)

    logRegular('init Function Cache...')
    setData('function', {
        'current_status': 'botstart',
        'status_in_query': false,
        'server_info_in_query': false,
        'poll_printer_info': false,
        'current_percent': -1,
        'status_cooldown': 0
    })

    logRegular('init Time Cache...')
    setData('time', {
        'total': 0,
        'duration': 0,
        'left': 0,
        'eta': 0
    })

    logRegular('init Layer Cache...')
    setData('layers', {
        'top': 0,
        'current': 0
    })

    configHelper.loadCache()
    localeHelper.loadCache()
    embedHelper.loadCache()
}

export function getMoonrakerClient() {
    return moonrakerClient
}

export function getDiscordClient() {
    return discordClient
}

export function getDatabase() {
    return database
}