import {MoonrakerClient} from "../clients/MoonrakerClient";
import {ConfigHelper} from "./ConfigHelper";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {StatusHelper} from "./StatusHelper";

export class SchedulerHelper {
    protected configHelper = new ConfigHelper()
    protected functionCache = getEntry('function')
    protected statusHelper = new StatusHelper()
    protected moonrakerClient: MoonrakerClient

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient

        this.scheduleModerate()
        this.scheduleHigh()
        this.scheduleHighSync()
    }

    protected scheduleHighSync() {
        setInterval( () => {
            updateData('moonraker_client', {
                'event_count': this.moonrakerClient.getWebsocket().underlyingWebsocket['_eventsCount']
            })
        }, this.configHelper.getHighSchedulerInterval())
    }

    protected scheduleHigh() {
        setInterval(async () => {
            if(this.functionCache.poll_server_info) {
                await this.pollServerInfo()
            }
        }, this.configHelper.getHighSchedulerInterval())
    }

    protected scheduleModerate() {
        setInterval(async () => {
            const machineInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "machine.system_info"}`)

            setData('machine_info', machineInfo.result)
        }, this.configHelper.getModerateSchedulerInterval())
    }

    protected async pollServerInfo() {
        const serverInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.info"}`)

        updateData('server_info', serverInfo.result)

        console.log(serverInfo.result)

        if(serverInfo.result.klippy_state === 'error') {
            await this.requestPrintInfo()
        }

        await this.statusHelper.update()
    }

    protected async requestPrintInfo() {
        const printerInfo = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "printer.info"}`)

        updateData('printer_info', printerInfo.result)
    }
}