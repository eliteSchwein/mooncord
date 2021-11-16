import { updateLayers } from "../../../helper/LayerHelper";
import { updateTimes } from "../../../helper/TimeHelper";
import {getEntry} from "../../../utils/CacheUtil";

export class PrintProgressNotification {
    protected functionCache = getEntry('function')
    public parse(message) {
        if(this.functionCache.current_status !== 'printing') { return }

        updateTimes()
        updateLayers()
    }
}