import {ConsoleLogger} from '../helper/ConsoleLogger'
import {ConfigHelper} from '../helper/ConfigHelper'
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import { waitUntil } from 'async-wait-until'

const logger = new ConsoleLogger()

const startUpId = 1

let websocket: Websocket

export class MoonrakerClient {
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()

    public constructor() {
        logger.logSuccess('Connect to MoonRaker...')

        this.connect()
    }

    private async connect() {
        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        const socketUrl = this.config.getMoonrakerSocketUrl()

        websocket = new WebsocketBuilder(`${socketUrl}?token=${oneShotToken}`).build()

        websocket.addEventListener(WebsocketEvents.error, ((instance, ev) => {
            logger.logError('Websocket Error:')
            console.log(ev)
            process.exit(5)
        }))

        websocket.addEventListener(WebsocketEvents.open, (((instance, ev) => {
            logger.logSuccess('Connected to MoonRaker')

            this.sendInitCommands()

            this.subscribeToCommands()
        })))
    }

    private async subscribeToCommands() {
        logger.logRegular('Subscribe to MoonRaker Events...')

        const objects = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.list"}`)

        const data = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.subscribe", "params": { "objects":${JSON.stringify(objects)}}}`)
    }

    private sendInitCommands() {
        logger.logRegular('Send Initial MoonRaker Commands...')

        websocket.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}, "id": ${startUpId}}`)
        websocket.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${startUpId}}`)
        websocket.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${startUpId}}`)
    }

    public async send(message: string) {
        const id = Math.floor(Math.random() * 10_000) + 1

        const messageData = JSON.parse(message)

        let response: any

        messageData.id = id

        function handler(instance: Websocket, ev: any) {
            const responseData = JSON.parse(ev.data)
            if(responseData.id === id) {
                response = responseData

                websocket.removeEventListener(WebsocketEvents.message, handler)
            }
        }

        websocket.addEventListener(WebsocketEvents.message, handler)

        websocket.send(JSON.stringify(messageData))

        await waitUntil(() => typeof response !== 'undefined')

        return response
    }

    public getWebsocket() {
        return websocket
    }
}