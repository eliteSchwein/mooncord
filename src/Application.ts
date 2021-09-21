import * as packageConfig from '../package.json'
import {MoonrakerClient} from './clients/MoonrakerClient'
import {logEmpty, logSuccess} from "./helper/ConsoleLogger";


logSuccess(`Starting ${packageConfig.name} ${packageConfig.version}...`)
logEmpty()

Object.assign(global, { WebSocket: require('ws') })

const moonrakerClient = new MoonrakerClient()


export const getMoonrakerClient = moonrakerClient

