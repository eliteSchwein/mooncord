import {getEntry, setData} from "../../../utils/CacheUtil";
import {sleep} from "../../../helper/DataHelper";

export class TimelapseMacroNotification {
    protected functionCache = getEntry('function')

    public async parse(message) {
        if (typeof (message.params) === 'undefined') {
            return
        }

        const params = message.params[0]
        const timelapseMacro = params['gcode_macro TIMELAPSE_TAKE_FRAME']

        if (timelapseMacro === undefined) {
            return
        }
        if (timelapseMacro.is_paused === undefined) {
            return
        }

        const macroPaused = timelapseMacro.is_paused

        if (!macroPaused) {
            await sleep(200)
        }

        this.functionCache.ignore_pause = timelapseMacro.is_paused

        setData('function', this.functionCache)
    }
}