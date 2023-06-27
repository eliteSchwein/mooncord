'use strict'

import servicesMeta from '../meta/services.json'
import {getMoonrakerClient} from "../Application";
import {getEntry} from "../utils/CacheUtil";
import {logWarn} from "./LoggerHelper";

export class ServiceHelper {
    public async restartServiceByFile(fileName: string) {
        if (/^(.*\.(?!(cfg|conf|json)$))?[^.]*$/g.test(fileName)) {
            return false
        }

        const moonrakerClient = getMoonrakerClient()
        const functionCache = getEntry('function')
        const currentStatus = functionCache.current_status

        let service = servicesMeta[fileName]

        if (typeof service === 'undefined') {
            service = 'klipper'
        }

        if (currentStatus !== 'ready') {
            logWarn(`Service Restart for ${service} failed because the Print Status is ${currentStatus}`)
            return false
        }

        const serviceRestartRequest = await moonrakerClient.send({
            "method": "machine.services.restart",
            "params": {"service": service}
        }, Number.POSITIVE_INFINITY)

        if (typeof serviceRestartRequest.result !== 'undefined') {
            return service
        }

        return false
    }
}