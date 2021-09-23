import {ConfigHelper} from '../helper/ConfigHelper'
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import {waitUntil} from 'async-wait-until'
import {logError, logRegular, logSuccess} from '../helper/ConsoleLogger'
import {setData} from '../utils/CacheUtil'

const requests: any = {}

let websocket: Websocket

export class MoonrakerClient {
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()
    protected ready = false

    public constructor() {
        logSuccess('Connect to MoonRaker...')

        this.connect()
    }

    private async connect() {
        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        const socketUrl = this.config.getMoonrakerSocketUrl()

        websocket = new WebsocketBuilder(`${socketUrl}?token=${oneShotToken}`).build()

        websocket.addEventListener(WebsocketEvents.error, ((instance, ev) => {
            logError('Websocket Error:')
            console.log(ev)
            process.exit(5)
        }))

        websocket.addEventListener(WebsocketEvents.open, (((instance, ev) => {
            logSuccess('Connected to MoonRaker')

            this.registerEvents()

            this.sendInitCommands()
        })))
    }

    private async sendInitCommands() {
        logRegular('Send Initial Commands...')

        logRegular('Retrieve MoonRaker Update Manager Data...')
        const updates = await this.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}}`, 300_000)

        logRegular('Retrieve Printer Info...')
        const printerInfo = await this.send(`{"jsonrpc": "2.0", "method": "printer.info"}`)

        logRegular('Retrieve Server Info...')
        const serverInfo = await this.send(`{"jsonrpc": "2.0", "method": "server.info"}`)

        logRegular('Retrieve Subscribable MoonRaker Objects...')
        const objects = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.list"}`)

        const subscriptionObjects: any = {}

        for (const index in objects.result.objects) {
            const object = objects.result.objects[index]
            subscriptionObjects[object] = null
        }

        logRegular('Subscribe to MoonRaker Objects...')
        const data = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.subscribe", "params": { "objects":${JSON.stringify(subscriptionObjects)}}}`)

        this.ready = true

        setData('updates', updates.result)
        setData('printer_info', printerInfo.result)
        setData('server_info', serverInfo.result)
        setData('state', data.result.status)

        logSuccess('MoonRaker Client is ready')
    }

    private registerEvents() {
        logRegular('Register Events...')
        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if(typeof(messageData) === 'undefined') { return }
            if(typeof(messageData.id) === 'undefined') { return }

            requests[messageData.id] = messageData
        }))
    }

    public async send(message: string, timeout = 10_000) {
        const id = Math.floor(Math.random() * 10_000) + 1

        const messageData = JSON.parse(message)

        messageData.id = id

        websocket.send(JSON.stringify(messageData))

        await waitUntil(() => typeof requests[id] !== 'undefined', { timeout, intervalBetweenAttempts: 500 })

        return requests[id]
    }

    public isReady() {
        if(!this.isConnected()) { return false }

        return this.ready
    }

    public isConnected() {
        if(typeof websocket === 'undefined') { return false }

        return Boolean(websocket.underlyingWebsocket.OPEN)
    }

    public getWebsocket() {
        return websocket
    }
}