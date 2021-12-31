import {getEntry} from "../utils/CacheUtil";

export class MCUHelper {
    protected stateCache = getEntry('state')

    public getMCUOptions() {
        const options = []

        for(const key in this.stateCache) {
            if(key.startsWith('mcu')) {
                options.push({
                    "label": key,
                    "value": key
                })
            }
        }

        return options
    }
}