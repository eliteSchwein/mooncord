import {ConsoleLogger} from "../helper/ConsoleLogger";
import {ConfigHelper} from "../helper/ConfigHelper";

const logger = new ConsoleLogger()

export class MoonrakerClient {
    protected config = new ConfigHelper()
    public constructor() {
        logger.logSuccess('connect to MoonRaker...')
    }
}