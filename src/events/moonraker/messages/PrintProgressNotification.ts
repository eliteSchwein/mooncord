import {ConfigHelper} from "../../../helper/ConfigHelper";
import {updateLayers} from "../../../helper/LayerHelper";
import {StatusHelper} from "../../../helper/StatusHelper";
import {updateTimes} from "../../../helper/TimeHelper";
import {getEntry} from "../../../utils/CacheUtil";

export class PrintProgressNotification {
    protected functionCache = getEntry('function')
    protected configHelper = new ConfigHelper()
    protected statusHelper = new StatusHelper()

    public parse(message) {
        if (this.functionCache.current_status !== 'printing') {
            return
        }

        updateTimes()
        updateLayers()

        if (!this.configHelper.isStatusPerPercent()) {
            return
        }

        this.statusHelper.update()
    }
}