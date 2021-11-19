import {ConfigHelper} from '../helper/ConfigHelper'
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import {waitUntil} from 'async-wait-until'
import {
    changePath,
    changeTempPath,
    logError,
    logRegular,
    logSuccess,
    logWarn,
    unhookTempLog
} from '../helper/LoggerHelper'
import {getLogPath, setData} from '../utils/CacheUtil'
import {MessageHandler} from "../events/moonraker/MessageHandler";
import {FileListHelper} from "../helper/FileListHelper";
import {MetadataHelper} from "../helper/MetadataHelper";
import {SchedulerHelper} from "../helper/SchedulerHelper";

const requests: any = {}
let messageHandler: MessageHandler

export class MoonrakerClient {
    protected fileListHelper = new FileListHelper(this)
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()
    protected ready = false
    protected metadataHelper = new MetadataHelper(this)
    protected websocket:Websocket

    public constructor() {
        logSuccess('Connect to MoonRaker...')

        this.connect()
    }

    private async connect() {
        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        const socketUrl = this.config.getMoonrakerSocketUrl()

        this.websocket = new WebsocketBuilder(`${socketUrl}?token=${oneShotToken}`).build()

        this.websocket.addEventListener(WebsocketEvents.error, ((instance, ev) => {
            logError('Websocket Error:')
            console.log(ev)
            process.exit(5)
        }))

        this.websocket.addEventListener(WebsocketEvents.open, ((async (instance, ev) => {
            logSuccess('Connected to MoonRaker')

            this.registerEvents()

            await this.sendInitCommands()

            this.changeLogPath()
        })))
    }

    public async sendInitCommands() {
        logRegular('Send Initial Commands...')

        logRegular('Retrieve MoonRaker Update Manager Data...')
        const updates = await this.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}}`, 300_000)

        logRegular('Retrieve Printer Info...')
        const printerInfo = await this.send(`{"jsonrpc": "2.0", "method": "printer.info"}`)
        
        logRegular('Retrieve Server Config...')
        const serverConfig = await this.send(`{"jsonrpc": "2.0", "method": "server.config"}`)

        logRegular('Retrieve Server Info...')
        const serverInfo = await this.send(`{"jsonrpc": "2.0", "method": "server.info"}`)

        logRegular('Retrieve Machine System Info...')
        const machineInfo = await this.send(`{"jsonrpc": "2.0", "method": "machine.system_info"}`)

        logRegular('Retrieve Proc Stats Info...')
        const procStats = await this.send(`{"jsonrpc": "2.0", "method": "machine.proc_stats"}`)

        logRegular('Retrieve Subscribable MoonRaker Objects...')
        const objects = await this.send(`{"jsonrpc": "2.0", "method": "printer.objects.list"}`)

        await this.fileListHelper.retrieveFiles()

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
        setData('server_config', serverConfig.result)
        setData('server_info', serverInfo.result)
        setData('machine_info', machineInfo.result)
        setData('proc_stats', procStats.result)
        setData('state', data.result.status)

        if(typeof data.result.status !== 'undefined') {
            if (typeof data.result.status.print_stats !== 'undefined') {
                if (data.result.status.print_stats.filename !== null) {
                    await this.metadataHelper.retrieveMetaData(data.result.status.print_stats.filename)
                }
            }
        }

        setData('moonraker_client', {
            'url': this.websocket.underlyingWebsocket.url,
            'readySince': new Date(),
            'event_count': this.websocket.underlyingWebsocket['_eventsCount']
        })
    }

    private changeLogPath() {
        if(this.config.isLogFileDisabled()) {
            logWarn('Log File is disabled!')
            unhookTempLog()
        } else if(this.config.getLogPath() !== '') {
            changeTempPath(this.config.getTempPath())
            changePath(this.config.getLogPath())
        } else {
            changeTempPath(this.config.getTempPath())
            changePath(getLogPath())
        }

        logSuccess('MoonRaker Client is ready')
    }

    private registerEvents() {
        logRegular('Register Events...')
        this.websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if(typeof(messageData) === 'undefined') { return }
            if(typeof(messageData.id) === 'undefined') { return }

            requests[messageData.id] = messageData
        }))

        messageHandler = new MessageHandler(this.websocket)
    }

    public async send(message: string, timeout = 10_000) {
        const id = Math.floor(Math.random() * 100_000) + 1

        const messageData = JSON.parse(message)

        messageData.id = id

        this.websocket.send(JSON.stringify(messageData))

        await waitUntil(() => typeof requests[id] !== 'undefined', { timeout, intervalBetweenAttempts: 500 })

        return requests[id]
    }

    public isReady() {
        if(!this.isConnected()) { return false }

        return this.ready
    }

    public isConnected() {
        if(typeof(this.websocket) === 'undefined') { return false }

        return Boolean(this.websocket.underlyingWebsocket.OPEN)
    }

    public getWebsocket() {
        return this.websocket
    }
}