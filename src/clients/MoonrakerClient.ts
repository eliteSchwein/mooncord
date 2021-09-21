import {ConsoleLogger} from '../helper/ConsoleLogger'
import {ConfigHelper} from '../helper/ConfigHelper'
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import { waitUntil } from 'async-wait-until'

const logger = new ConsoleLogger()

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
        })))
    }

    private async sendInitCommands() {
        logger.logRegular('Send Initial MoonRaker Commands...')

        const updates = await this.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}}`)
        const printerInfo = await this.send(`{"jsonrpc": "2.0", "method": "printer.info"}`)
        const serverInfo = await this.send(`{"jsonrpc": "2.0", "method": "server.info"}`)
        const objects = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.list"}`)

        const subscriptionObjects: any = {}

        for (const index in objects.result.objects) {
            const object = objects.result.objects[index]
            subscriptionObjects[object] = null
        }

        const data = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.subscribe", "params": { "objects":${JSON.stringify(subscriptionObjects)}}}`)

    }

    public async send(message: string) {
        const id = Math.floor(Math.random() * 10_000) + 1

        const messageData = JSON.parse(message)

        let response: any

        messageData.id = id

        function handler(instance: Websocket, ev: any) {
            const responseData = JSON.parse(ev.data)

            if(typeof(responseData.id) === 'undefined') { return }

            if(responseData.id === id) {
                response = responseData

                websocket.removeEventListener(WebsocketEvents.message, handler)
            }
        }

        websocket.addEventListener(WebsocketEvents.message, handler)

        websocket.send(JSON.stringify(messageData))

        await waitUntil(() => typeof response !== 'undefined', { timeout: 10_000 })

        return response
    }

    public getWebsocket() {
        return websocket
    }
}