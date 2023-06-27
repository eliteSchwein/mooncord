'use strict'

import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/DataHelper";

import {setData} from "../utils/CacheUtil";
import {LocaleHelper} from "../helper/LocaleHelper";

export class DiscordStatusGenerator {

    public generateStatusCache() {
        const tempCache = {}
        const localeHelper = new LocaleHelper()
        const configHelper = new ConfigHelper()
        const statusMeta = configHelper.getStatusMeta()
        const locale = localeHelper.getLocale()

        for (const statusId in statusMeta) {
            const statusData = statusMeta[statusId]
            const statusLocale = locale.embeds[statusData.embed_id]
            tempCache[statusId] = statusData

            mergeDeep(tempCache[statusId], {
                title: statusLocale.title,
                activity: {
                    title: statusLocale.activity
                }
            })
        }

        const fieldAssign = JSON.stringify(tempCache)
            .replace(/(\${locale.print_time})/g, locale.embeds.fields.print_time)
            .replace(/(\${locale.print_layers})/g, locale.embeds.fields.print_layers)
            .replace(/(\${locale.eta_print_time})/g, locale.embeds.fields.eta_print_time)
            .replace(/(\${locale.print_progress})/g, locale.embeds.fields.print_progress)

        mergeDeep(tempCache, JSON.parse(fieldAssign))

        setData('status_messages', tempCache)
    }
}