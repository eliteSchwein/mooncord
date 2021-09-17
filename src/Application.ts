import * as packageConfig from '../package.json'
import {ConsoleLogger} from "./utils/ConsoleLogger";

const logger = new ConsoleLogger()

logger.logSuccess(`starting ${packageConfig.name} ${packageConfig.version}...`)
