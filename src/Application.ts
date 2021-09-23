import * as packageConfig from '../package.json'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {logEmpty, logSuccess} from "./helper/ConsoleLogger";
import {DatabaseUtil} from "./utils/DatabaseUtil";
import {DiscordClient} from "./clients/DiscordClient";


logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)
logEmpty()

Object.assign(global, { WebSocket: require('ws') })

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