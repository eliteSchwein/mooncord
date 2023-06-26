'use strict'

import {ConfigHelper} from "../../../helper/ConfigHelper";
import {updateLayers} from "../../../helper/LayerHelper";
import {StatusHelper} from "../../../helper/StatusHelper";
import {updateTimes} from "../../../helper/TimeHelper";
import {getEntry} from "../../../utils/CacheUtil";

export class PrintProgressNotification {
    public parse(message) {
        const functionCache = getEntry('function')

        if (functionCache.current_status !== 'printing') {
            return
        }

        updateTimes()
        updateLayers()

        if (!new ConfigHelper().isStatusPerPercent()) {
            return
        }

        new StatusHelper().update()
    }
}