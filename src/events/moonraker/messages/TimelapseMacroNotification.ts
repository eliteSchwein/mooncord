'use strict'

import {getEntry, setData} from "../../../utils/CacheUtil";
import {sleep} from "../../../helper/DataHelper";

export class TimelapseMacroNotification {
    public async parse(message) {
        if (typeof (message.params) === 'undefined') {
            return false
        }

        const params = message.params[0]
        const timelapseMacro = params['gcode_macro TIMELAPSE_TAKE_FRAME']

        if (timelapseMacro === undefined) {
            return false
        }
        if (timelapseMacro.is_paused === undefined) {
            return false
        }

        const cache = getEntry('function')

        const macroPaused = timelapseMacro.is_paused

        if (!macroPaused) {
            await sleep(200)
        }

        cache.ignore_pause = timelapseMacro.is_paused

        setData('function', cache)

        return true
    }
}