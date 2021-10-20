import * as packageConfig from '../package.json'
import {DiscordClient} from './clients/DiscordClient'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {logEmpty, logSuccess} from './helper/ConsoleLogger'
import {DatabaseUtil} from './utils/DatabaseUtil'
import {LocaleHelper} from "./helper/LocaleHelper";
import { findValue, setData } from './utils/CacheUtil'

logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)
logEmpty()

setData('package_config', packageConfig)

Object.assign(global, { WebSocket: require('ws') })

const localeHelper = new LocaleHelper()

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

export function getLocaleHelper() {
    return localeHelper
}