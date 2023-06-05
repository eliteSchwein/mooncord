import {ConfigHelper} from '../helper/ConfigHelper'
import {Websocket, WebsocketBuilder, WebsocketEvents} from 'websocket-ts'
import {APIKeyHelper} from '../helper/APIKeyHelper'
import {waitUntil} from 'async-wait-until'
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
import {setData} from '../utils/CacheUtil'
import {MessageHandler} from "../events/moonraker/MessageHandler";
import {FileListHelper} from "../helper/FileListHelper";
import {MetadataHelper} from "../helper/MetadataHelper";
import * as App from '../Application'
import {StatusHelper} from "../helper/StatusHelper";
import {TempHelper} from "../helper/TempHelper";
import {PowerDeviceHelper} from "../helper/PowerDeviceHelper";
import {HistoryHelper} from "../helper/HistoryHelper";

const requests: any = {}
let messageHandler: MessageHandler

export class MoonrakerClient {
    protected fileListHelper = new FileListHelper(this)
    protected config = new ConfigHelper()
    protected apiKeyHelper = new APIKeyHelper()
    protected tempHelper = new TempHelper()
    protected ready = false
    protected metadataHelper = new MetadataHelper(this)
    protected websocket: Websocket
    protected alreadyRunning = false
    protected reconnectScheduler: any
    protected reconnectAttempt = 1
    protected powerDeviceHelper = new PowerDeviceHelper(this)
    protected historyHelper = new HistoryHelper(this)

    public async connect() {
        logSuccess('Connect to MoonRaker...')

        this.ready = false

        const oneShotToken = await this.apiKeyHelper.getOneShotToken()
        let socketUrl = this.config.getMoonrakerSocketUrl()

        if(socketUrl === undefined ||
            socketUrl === '') {
            socketUrl = `${this.config.getMoonrakerUrl()}/websocket`
        }

        console.log(`"${socketUrl}"`)
        socketUrl = socketUrl.replace(/(http:\/\/)|(https:\/\/)/g, 'ws://')

        this.websocket = new WebsocketBuilder(`${socketUrl}?token=${oneShotToken}`)
            .build()

        this.websocket.addEventListener(WebsocketEvents.close, ((async (instance, ev) => {
            await this.closeHandler(instance, ev)
        })))

        this.websocket.addEventListener(WebsocketEvents.error, ((async (instance, ev) => {
            await this.errorHandler(instance, ev)
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

        this.getCacheData({"method": "machine.update.status", "params": {"refresh": false}}, 'updates')
        this.getCacheData({"method": "printer.info"}, 'printer_info')
        this.getCacheData({"method": "server.config"}, 'server_config')
        this.getCacheData({"method": "server.info"}, 'server_info')
        this.getCacheData({"method": "machine.system_info"}, 'machine_info')
        this.getCacheData({"method": "machine.proc_stats"}, 'proc_stats')

        logRegular('Retrieve Subscribable MoonRaker Objects...')
        const objects = await this.send({"method": "printer.objects.list"})

        await this.historyHelper.parseData()

        this.powerDeviceHelper.getPowerDevices()

        this.fileListHelper.retrieveFiles('config', 'config_files')
        this.fileListHelper.retrieveFiles('gcodes', 'gcode_files')
        this.fileListHelper.retrieveFiles('timelapse', 'timelapse_files', /(.*\.mp4)/g)

        const subscriptionObjects: any = {
            'webhooks.state': null,
            'webhooks.state_message': null
        }

        for (const index in objects.result.objects) {
            const object = objects.result.objects[index]
            subscriptionObjects[object] = null
        }

        delete subscriptionObjects.webhooks

        logRegular('Subscribe to MoonRaker Objects...')
        const data = await this.send({
            "method": "printer.objects.subscribe",
            "params": {"objects": subscriptionObjects}
        })

        this.ready = true

        setData('state', data.result.status)

        if (typeof data.result.status !== 'undefined') {
            if (typeof data.result.status.print_stats !== 'undefined') {
                if (data.result.status.print_stats.filename !== null) {
                    await this.metadataHelper.updateMetaData(data.result.status.print_stats.filename)
                }
            }
        }

        setData('moonraker_client', {
            'url': this.websocket.underlyingWebsocket.url,
            'readySince': Date.now() / 1000,
            'event_count': this.websocket.underlyingWebsocket['_eventsCount']
        })

        this.tempHelper.generateColors(data.result.status)
    }

    public changeLogPath() {
        if (this.config.isLogFileDisabled()) {
            logWarn('Log File is disabled!')
            unhookTempLog()
        } else if (this.config.getLogPath() !== '') {
            changePath(this.config.getLogPath())
        }

        changeTempPath(this.config.getTempPath())

        logSuccess('MoonRaker Client is ready')
    }

    public sendThread(message, timeout = 10_000) {
        new Promise(async (resolve, reject) => {
            try {
                await this.send(message, timeout)
            } catch (e) {
                logError(`An Error occured while sending a Websocket Request`)
                logError(`Reason: ${e}`)
                logError(`Websocket Request: ${JSON.stringify(message, null, 4)}`)
            }
        })
    }

    public async send(message, timeout = 10_000) {
        const id = Math.floor(Math.random() * 100_000) + 1

        message.id = id
        message.jsonrpc = '2.0'

        this.websocket.send(JSON.stringify(message))

        await waitUntil(() => typeof requests[id] !== 'undefined', {timeout, intervalBetweenAttempts: 500})

        return requests[id]
    }

    public isReady() {
        if (!this.isConnected()) {
            return false
        }

        return this.ready
    }

    public isConnected() {
        if (typeof (this.websocket) === 'undefined') {
            return false
        }

        return Boolean(this.websocket.underlyingWebsocket.OPEN)
    }

    public getWebsocket() {
        return this.websocket
    }

    public close() {
        this.websocket.close()
    }

    private async errorHandler(instance, event) {
        const reason = event.message
        logEmpty()
        logError('Websocket Error:')
        logError(event.error)
        if (!this.alreadyRunning) {
            process.exit(5)
        }
    }

    private async closeHandler(instance, event) {
        logWarn('Moonraker disconnected!')
        if (!this.alreadyRunning) {
            return
        }
        if (this.reconnectAttempt !== 1) {
            return
        }

        const statusHelper = new StatusHelper()
        await statusHelper.update('moonraker_disconnected')

        this.reconnectScheduler = setInterval(() => {
            logRegular(`Reconnect Attempt ${this.reconnectAttempt} to Moonraker...`)
            void this.connect()
            this.reconnectAttempt++
        }, this.config.getMoonrakerRetryInterval() * 1000)
    }

    private async connectHandler(instance, event) {
        if (this.alreadyRunning) {
            return
        }
        if (typeof this.reconnectScheduler !== 'undefined') {
            return
        }

        logSuccess('Connected to MoonRaker')

        this.alreadyRunning = true
        this.registerEvents()
        await this.sendInitCommands()
        this.changeLogPath()
    }

    private async reconnectHandler(instance, event) {
        if (!this.alreadyRunning) {
            return
        }
        if (typeof this.reconnectScheduler === 'undefined') {
            return
        }

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

    private getCacheData(websocketCommand: any, cacheKey: string) {
        new Promise(async (resolve, reject) => {
            logRegular(`Retrieve Data for ${cacheKey}...`)
            const data = await this.send(websocketCommand, 300_000)

            setData(cacheKey, data.result)
        })
    }

    private registerEvents() {
        logRegular('Register Events...')
        this.websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if (typeof (messageData) === 'undefined') {
                return
            }
            if (typeof (messageData.id) === 'undefined') {
                return
            }

            requests[messageData.id] = messageData
        }))

        messageHandler = new MessageHandler(this.websocket)
    }
}