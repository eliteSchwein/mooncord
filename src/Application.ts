import * as packageConfig from '../package.json'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {hookLogFile, logEmpty, logRegular, logSuccess} from './helper/LoggerHelper'
import {DatabaseUtil} from './utils/DatabaseUtil'
import {LocaleHelper} from "./helper/LocaleHelper";
import { findValue, setData } from './utils/CacheUtil'
import {ConfigHelper} from "./helper/ConfigHelper";
import {EmbedHelper} from "./helper/EmbedHelper";

hookLogFile()

logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)

logRegular('load Package Cache...')
setData('package_config', packageConfig)

Object.assign(global, { WebSocket: require('ws') })

const localeHelper = new LocaleHelper()
const configHelper = new ConfigHelper()
const embedHelper = new EmbedHelper()
configHelper.loadCache()
localeHelper.loadCache()
embedHelper.loadCache()

logEmpty()

const moonrakerClient = new MoonrakerClient()
const database = new DatabaseUtil()
const discordClient = new DiscordClient()

export function getMoonrakerClient() {
    return moonrakerClient
}

export function getDiscordClient() {
    return discordClient
}

export function getDatabase() {
    return database
}