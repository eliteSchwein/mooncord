import servicesMeta from '../meta/services.json'
import {getMoonrakerClient} from "../Application";
import {getEntry} from "../utils/CacheUtil";
import {logWarn} from "./LoggerHelper";

export class ServiceHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected functionCache = getEntry('function')
    protected currentStatus = this.functionCache.current_status

    public async restartServiceByFile(fileName: string) {
        if (/^(.*\.(?!(cfg|conf|json)$))?[^.]*$/g.test(fileName)) {
            return false
        }

        let service = servicesMeta[fileName]

        if (typeof service === 'undefined') {
            service = 'klipper'
        }

        if (this.currentStatus !== 'ready') {
            logWarn(`Service Restart for ${service} failed because the Print Status is ${this.currentStatus}`)
            return false
        }

        const serviceRestartRequest = await this.moonrakerClient.send({
            "method": "machine.services.restart",
            "params": {"service": service}
        }, Number.POSITIVE_INFINITY)

        if (typeof serviceRestartRequest.result !== 'undefined') {
            return service
        }

        return false
    }
}