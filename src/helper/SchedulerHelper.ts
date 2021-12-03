import {MoonrakerClient} from "../clients/MoonrakerClient";
import {ConfigHelper} from "./ConfigHelper";
import {findValue, getEntry, setData, updateData} from "../utils/CacheUtil";
import {StatusHelper} from "./StatusHelper";
import {logRegular} from "./LoggerHelper";

export class SchedulerHelper {
    protected configHelper = new ConfigHelper()
    protected functionCache = getEntry('function')
    protected statusHelper = new StatusHelper()
    protected moonrakerClient: MoonrakerClient

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient

        this.scheduleModerate()
        this.scheduleHigh()
    }

    protected scheduleHigh() {
        setInterval( () => {
            this.functionCache = getEntry('function')

            if(typeof this.moonrakerClient.getWebsocket() === 'undefined') {
                return
            }

            updateData('moonraker_client', {
                'event_count': this.moonrakerClient.getWebsocket().underlyingWebsocket['_eventsCount']
            })
            if(this.functionCache.poll_printer_info) {
                void this.pollServerInfo()
            }
        }, 250)
    }

    protected scheduleModerate() {
        setInterval(async () => {
            const machineInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "machine.system_info"}`)

            setData('machine_info', machineInfo.result)
        }, 60000)
    }

    protected scheduleStatus() {
        setInterval(async () => {
            if(this.configHelper.isStatusPerPercent()) {
                this.updateStatusCooldown()
            } else {
                this.postPrintProgress()
            }
        }, this.getStatusInterval())
    }

    protected postPrintProgress() {
        if(this.functionCache.current_status !== 'printing') { return }

        this.statusHelper.update()
    }

    protected updateStatusCooldown() {
        const statusCooldown = this.functionCache.status_cooldown
        if(statusCooldown === 0) { return }

        this.functionCache.status_cooldown--

        updateData('function', this.functionCache)
    }

    protected getStatusInterval() {
        if(this.configHelper.isStatusPerPercent()) {
            return this.configHelper.getStatusMinInterval() * 1000
        } else {
            return this.configHelper.getStatusInterval() * 1000 * 60
        }
    }

    protected async pollServerInfo() {
        if(this.functionCache.server_info_in_query) { return }

        updateData('function', {
            'server_info_in_query': true
        })

        const currentStatus = findValue('function.current_status')
        const serverInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.info"}`)

        if(typeof serverInfo.result === 'undefined') { return }
        if(typeof serverInfo.result.klippy_state === 'undefined') { return }

        if(currentStatus !== serverInfo.result.klippy_state) {
            await this.requestPrintInfo()
        }

        updateData('server_info', serverInfo.result)

        updateData('function', {
            'server_info_in_query': false
        })

        if(serverInfo.result.klippy_state === 'ready') { return }

        await this.statusHelper.update()
    }

    protected async requestPrintInfo() {
        const printerInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "printer.info"}`)

        updateData('printer_info', printerInfo.result)
    }
}