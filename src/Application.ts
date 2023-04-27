import * as packageConfig from '../package.json'
import * as util from 'util'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {hookProcess, logEmpty, logError, logRegular, logSuccess, logWarn, tempHookLog} from './helper/LoggerHelper'
import {DatabaseUtil} from './utils/DatabaseUtil'
import {LocaleHelper} from "./helper/LocaleHelper";
import {getEntry, setData} from './utils/CacheUtil'
import {ConfigHelper} from "./helper/ConfigHelper";
import {EmbedHelper} from "./helper/EmbedHelper";
import {SchedulerHelper} from "./helper/SchedulerHelper";
import {StatusHelper} from "./helper/StatusHelper";
import {waitUntil} from "async-wait-until";
import {ModalHelper} from "./helper/ModalHelper";
import {createInterface} from "readline";

const args = process.argv.slice(2)

Object.assign(global, {WebSocket: require('ws')})

tempHookLog()
hookProcess()

logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)

const configHelper = new ConfigHelper()
configHelper.loadCache()

const localeHelper = new LocaleHelper()
const embedHelper = new EmbedHelper()
const modalHelper = new ModalHelper()

const moonrakerClient = new MoonrakerClient()
const database = new DatabaseUtil()
const discordClient = new DiscordClient()

const schedulerHelper = new SchedulerHelper()
const statusHelper = new StatusHelper()

void init()

async function init() {
    initCache()

    const userConfig = configHelper.getUserConfig()

    logEmpty()

    let currentInitState = 'Moonraker Client'

    try {
        await moonrakerClient.connect()
        await waitUntil(() => moonrakerClient.isReady(), {timeout: 30_000, intervalBetweenAttempts: 500})

        currentInitState = 'Database'
        await database.retrieveDatabase()
        await waitUntil(() => database.isReady(), {timeout: 30_000, intervalBetweenAttempts: 500})

        currentInitState = 'Discord Client'
        await discordClient.connect()
        await waitUntil(() => discordClient.isConnected(), {timeout: 30_000, intervalBetweenAttempts: 500})
    } catch (error) {
        logError(`couldn't load ${currentInitState} in Time! Reason: ${util.format(error)}`)
    }

    logRegular('Register Scheduler...')

    schedulerHelper.init(moonrakerClient)

    await statusHelper.update(null, true, discordClient)

    if(!args.includes('register-controller')) {
        return
    }

    for (let i = 0; i < 1024; i++) {
        logEmpty()
    }

    logRegular(`please invite the bot on a Server: 
        ${getEntry('invite_url')}`)
    logWarn('please dont use ctrl + c for copying the script, this will stop the install script!')
    logEmpty()
    logRegular(`after that please write your username (Example#123).`)

    const readline = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    readline.question('username:', userNameTag => {
        userNameTag = userNameTag.trim()
        setData('tmp_controller', userNameTag)
        logRegular(`please write with ${userNameTag} in a channel on your Server to activate Controller.`)
        readline.close();
    });
}

export function reloadCache() {
    logEmpty()
    logSuccess('reload Cache...')

    initCache()
}

export async function reconnectDiscord() {
    logEmpty()
    logSuccess('reconnect Discord...')
    await discordClient.connect()
}

export async function restartScheduler() {
    logEmpty()
    logSuccess('restart Scheduler...')
    schedulerHelper.clear()
    schedulerHelper.init(moonrakerClient)
}

export async function reconnectMoonraker() {
    logEmpty()
    logSuccess('reconnect Moonraker...')
    schedulerHelper.clear()
    moonrakerClient.close()

    await moonrakerClient.connect()
}

function initCache() {
    logRegular('load Package Cache...')
    setData('package_config', packageConfig)

    configHelper.loadCache()
    localeHelper.loadCache()
    embedHelper.loadCache()
    modalHelper.loadCache()
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