import * as packageConfig from '../package.json'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {logEmpty, logSuccess} from "./helper/ConsoleLogger";
import {DatabaseUtil} from "./utils/DatabaseUtil";


logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)
logEmpty()

Object.assign(global, { WebSocket: require('ws') })

const moonrakerClient = new MoonrakerClient()

const database = new DatabaseUtil(moonrakerClient)


export const getMoonrakerClient = moonrakerClient

export const getDatabase = database

