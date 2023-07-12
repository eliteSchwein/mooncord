'use strict'

import * as packageConfig from '../package.json'
import * as util from 'util'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {
    hookProcess,
    logEmpty,
    logError,
    logNotice,
    logRegular,
    logSuccess,
    logWarn,
    tempHookLog
} from './helper/LoggerHelper'
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

let firstLoad = true

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

    if(!args.includes('setup')) {
        return
    }

    const setupCode = (Math.random() + 1).toString(36).substring(2)

    setData('setup_mode', true)
    setData('setup_code', setupCode)

    for (let i = 0; i < 1024; i++) {
        logEmpty()
    }

    if (process.platform === "win32") {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.on("SIGINT", function () {
            process.emit("SIGINT");
        });
    }

    process.on('SIGINT', () => {});
    process.on('SIGQUIT', () => {});

    logRegular(`please invite the bot on a Server: 
        ${getEntry('invite_url')}`)
    logEmpty()
    logRegular(`after the invite please write the following code in a text channel:`)
    logNotice(setupCode)
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

    if(firstLoad) {
        firstLoad = false
    } else {
        configHelper.loadCache()
    }

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