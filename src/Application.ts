import * as packageConfig from '../package.json'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {hookProcess, logEmpty, logRegular, logSuccess, tempHookLog} from './helper/LoggerHelper'
import {DatabaseUtil} from './utils/DatabaseUtil'
import {LocaleHelper} from "./helper/LocaleHelper";
import { setData } from './utils/CacheUtil'
import {ConfigHelper} from "./helper/ConfigHelper";
import {EmbedHelper} from "./helper/EmbedHelper";
import {SchedulerHelper} from "./helper/SchedulerHelper";

tempHookLog()
hookProcess()

logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)

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

Object.assign(global, { WebSocket: require('ws') })

const configHelper = new ConfigHelper()
configHelper.loadCache()

const localeHelper = new LocaleHelper()
const embedHelper = new EmbedHelper()
localeHelper.loadCache()
embedHelper.loadCache()

logEmpty()

const moonrakerClient = new MoonrakerClient()
const database = new DatabaseUtil()
const discordClient = new DiscordClient()

logRegular('Register Scheduler...')

void new SchedulerHelper(moonrakerClient)

export function getMoonrakerClient() {
    return moonrakerClient
}

export function getDiscordClient() {
    return discordClient
}

export function getDatabase() {
    return database
}