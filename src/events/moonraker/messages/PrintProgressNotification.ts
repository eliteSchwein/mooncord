'use strict'

import {ConfigHelper} from "../../../helper/ConfigHelper";
import {updateLayers} from "../../../helper/LayerHelper";
import {StatusHelper} from "../../../helper/StatusHelper";
import {updateTimes} from "../../../helper/TimeHelper";
import {getEntry} from "../../../utils/CacheUtil";

export class PrintProgressNotification {
    public async parse(message) {
        const functionCache = getEntry('function')

        if (functionCache.current_status !== 'printing') {
            return false
        }

        updateTimes()
        updateLayers()

        if (!new ConfigHelper().isStatusPerPercent()) {
            return false
        }

        await new StatusHelper().update()

        return true
    }
}