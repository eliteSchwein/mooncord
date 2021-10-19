import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/ObjectMergeHelper";

import statusMapping from "../meta/status_mapping.json"
import {getLocaleHelper} from "../Application";
import {setData} from "../utils/CacheUtil";

export class DiscordStatusGenerator {
    protected config = new ConfigHelper()
    protected localeHelper = getLocaleHelper()

    public generateStatusCache() {
        const tempCache = {}
        const locale = this.localeHelper.getLocale()

        for(const statusId in statusMapping) {
            const statusLocale = locale.status[statusId]
            tempCache[statusId] = statusMapping[statusId]

            mergeDeep(tempCache[statusId], {
                title: statusLocale.title,
                activity: {
                    title: statusLocale.activity
                }
            })
        }

        const fieldAssign = JSON.stringify(tempCache)
            .replace(/(\${locale.print_time})/g, locale.fields.print_time)
            .replace(/(\${locale.print_layers})/g, locale.fields.print_layers)
            .replace(/(\${locale.eta_print_time})/g, locale.fields.eta_print_time)
            .replace(/(\${locale.print_progress})/g, locale.fields.print_progress)

        mergeDeep(tempCache, JSON.parse(fieldAssign))

        setData('status_messages', tempCache)
    }
}