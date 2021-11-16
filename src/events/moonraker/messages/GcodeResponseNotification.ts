import {FileListHelper} from "../../../helper/FileListHelper";
import {getMoonrakerClient} from "../../../Application";
import {getEntry} from "../../../utils/CacheUtil";
import { StatusHelper } from "../../../helper/StatusHelper";

export class GcodeResponseNotification {
    protected moonrakerClient = getMoonrakerClient()
    protected fileListHelper = new FileListHelper(this.moonrakerClient)
    protected stateCache = getEntry('state')
    protected statusHelper = new StatusHelper()
    public parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }
        
        const param = message.params[0]

        if(message.method !== 'notify_gcode_response') { return }

        if(param === '// action:cancel') {
            this.statusHelper.update('stop')
        }
    }
}