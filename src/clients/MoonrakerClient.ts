import {ConfigHelper} from '../helper/ConfigHelper'
import {ConstantBackoff, LinearBackoff, Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import {waitUntil} from 'async-wait-until'
import * as util from 'util'
import {
    changePath,
    changeTempPath,
    logEmpty,
    logError,
    logRegular,
    logSuccess,
    logWarn,
    unhookTempLog
} from '../helper/LoggerHelper'
import {findValue, getLogPath, setData} from '../utils/CacheUtil'
import {MessageHandler} from "../events/moonraker/MessageHandler";
import {FileListHelper} from "../helper/FileListHelper";
import {MetadataHelper} from "../helper/MetadataHelper";
import {SchedulerHelper} from "../helper/SchedulerHelper";
import { getObjectValue } from '../helper/DataHelper'
import * as App from '../Application'
import {StatusHelper} from "../helper/StatusHelper";

const requests: any = {}
let messageHandler: MessageHandler

export class MoonrakerClient {
    protected fileListHelper = new FileListHelper(this)
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()
    protected ready = false
    protected metadataHelper = new MetadataHelper(this)
    protected websocket: Websocket
    protected alreadyRunning = false
    protected reconnectScheduler: any
    protected reconnectAttempt = 1

    private async errorHandler(instance, event) {
        const reason = event.message
        logEmpty()
        logError('Websocket Error:')
        logError(event.error)
        if(!this.alreadyRunning) {
            process.exit(5)
        }
    }

    private async closeHandler(instance, event) {
        logWarn('Moonraker disconnected!')
        if(!this.alreadyRunning) { return }
        if(this.reconnectAttempt !== 1) { return }

        const statusHelper = new StatusHelper()
        await statusHelper.update('moonraker_disconnected')

        this.reconnectScheduler = setInterval(() => {
            logRegular(`Reconnect Attempt ${this.reconnectAttempt} to Moonraker...`)
            void this.connect()
            this.reconnectAttempt++
        }, this.config.getMoonrakerRetryInterval() * 1000)
    }

    private async connectHandler(instance, event) {
        if (this.alreadyRunning) { return }
        if (typeof this.reconnectScheduler !== 'undefined') { return }

        logSuccess('Connected to MoonRaker')

        this.alreadyRunning = true
        this.registerEvents()
        await this.sendInitCommands()
        this.changeLogPath()
    }

    private async reconnectHandler(instance, event) {
        if (!this.alreadyRunning) { return }
        if (typeof this.reconnectScheduler === 'undefined') { return }

        const statusHelper = new StatusHelper()

        logSuccess('Reconnected to MoonRaker')

        this.reconnectAttempt = 1

        this.registerEvents()

        App.reloadCache()

        await this.sendInitCommands()

        this.changeLogPath()

        await App.reconnectDiscord()
        await App.restartScheduler()
        await statusHelper.update()
    }

    public async connect() {
        logSuccess('Connect to MoonRaker...')

        this.ready = false

        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        const socketUrl = this.config.getMoonrakerSocketUrl()

        this.websocket = new WebsocketBuilder(`${socketUrl}?token=${oneShotToken}`)
            .build()
            
        this.websocket.addEventListener(WebsocketEvents.close, ((async (instance, ev) => {
            this.closeHandler(instance, ev)
        })))
            
        this.websocket.addEventListener(WebsocketEvents.error, ((async (instance, ev) => {
            this.errorHandler(instance, ev)
        })))

        this.websocket.addEventListener(WebsocketEvents.open, ((async (instance, ev) => {
            clearInterval(this.reconnectScheduler)

            await this.reconnectHandler(instance, ev)
            await this.connectHandler(instance, ev)

            this.reconnectScheduler = undefined
        })))
    }

    public async sendInitCommands() {
        logRegular('Send Initial Commands...')

        logRegular('Retrieve MoonRaker Update Manager Data...')
        const updates = await this.send({"method": "machine.update.status", "params":{"refresh": false}}, 300_000)

        logRegular('Retrieve Printer Info...')
        const printerInfo = await this.send({"method": "printer.info"})
        
        logRegular('Retrieve Server Config...')
        const serverConfig = await this.send({"method": "server.config"})

        logRegular('Retrieve Server Info...')
        const serverInfo = await this.send({"method": "server.info"})

        logRegular('Retrieve Machine System Info...')
        const machineInfo = await this.send({"method": "machine.system_info"})

        logRegular('Retrieve Proc Stats Info...')
        const procStats = await this.send({"method": "machine.proc_stats"})

        logRegular('Retrieve Subscribable MoonRaker Objects...')
        const objects = await this.send({"method": "printer.objects.list"})

        await this.fileListHelper.retrieveFiles()

        const subscriptionObjects: any = {}

        for (const index in objects.result.objects) {
            const object = objects.result.objects[index]
            subscriptionObjects[object] = null
        }

        logRegular('Subscribe to MoonRaker Objects...')
        const data = await this.send({"method": "printer.objects.subscribe", "params": { "objects": subscriptionObjects}})

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
                    await this.metadataHelper.updateMetaData(data.result.status.print_stats.filename)
                }
            }
        }

        setData('moonraker_client', {
            'url': this.websocket.underlyingWebsocket.url,
            'readySince': new Date(),
            'event_count': this.websocket.underlyingWebsocket['_eventsCount']
        })
    }

    public changeLogPath() {
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

    public async send(message, timeout = 10_000) {
        const id = Math.floor(Math.random() * 100_000) + 1

        message.id = id
        message.jsonrpc = '2.0'

        this.websocket.send(JSON.stringify(message))

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

    public close() {
        this.websocket.close()
    }
}