import {ConsoleLogger} from "../helper/ConsoleLogger"
import {ConfigHelper} from "../helper/ConfigHelper"
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from "../helper/APIKeyHelper";

const logger = new ConsoleLogger()

let websocket: Websocket

export class MoonrakerClient {
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()

    public constructor() {
        logger.logSuccess('connect to MoonRaker...')

        this.connect()
    }

    private async connect() {
        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        websocket = new WebsocketBuilder(`${this.config.getMoonrakerUrl()}?token=${oneShotToken}`).build()
    }

    public getWebsocket() {
        return websocket
    }
}