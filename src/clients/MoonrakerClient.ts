'use strict'

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
import {WebcamHelper} from "../helper/WebcamHelper";

const requests: any = {}
let messageHandler: MessageHandler

export class MoonrakerClient {
    protected ready = false
    protected websocket: Websocket
    protected alreadyRunning = false
    protected reconnectScheduler: any
    protected reconnectAttempt = 1

    public async connect() {
        logSuccess('Connect to MoonRaker...')

        this.ready = false

        const config = new ConfigHelper()

        const oneShotToken = await new APIKeyHelper().getOneShotToken()
        let socketUrl = config.getMoonrakerSocketUrl()

        if(socketUrl === undefined ||
            socketUrl === '') {
            socketUrl = `${config.getMoonrakerUrl()}/websocket`
        }

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

        await new HistoryHelper().parseData()

        new PowerDeviceHelper().getPowerDevices()

        const fileListHelper = new FileListHelper()

        fileListHelper.retrieveFiles('config', 'config_files')
        fileListHelper.retrieveFiles('gcodes', 'gcode_files')
        fileListHelper.retrieveFiles('logs', 'log_files')
        fileListHelper.retrieveFiles('timelapse', 'timelapse_files', /(.*\.mp4)/g)

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
                    await new MetadataHelper().updateMetaData(data.result.status.print_stats.filename)
                }
            }
        }

        setData('moonraker_client', {
            'url': this.websocket.underlyingWebsocket.url,
            'readySince': Date.now() / 1000,
            'event_count': this.websocket.underlyingWebsocket['_eventsCount']
        })

        new TempHelper().generateColors(data.result.status)
        void new WebcamHelper().generateCache()
    }

    public changeLogPath() {
        const config = new ConfigHelper()

        if (config.isLogFileDisabled()) {
            logWarn('Log File is disabled!')
            unhookTempLog()
        } else if (config.getLogPath() !== '') {
            changePath(config.getLogPath())
        }

        changeTempPath(config.getTempPath())

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

        const config = new ConfigHelper()

        this.reconnectScheduler = setInterval(() => {
            logRegular(`Reconnect Attempt ${this.reconnectAttempt} to Moonraker...`)
            void this.connect()
            this.reconnectAttempt++
        }, config.getMoonrakerRetryInterval() * 1000)
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