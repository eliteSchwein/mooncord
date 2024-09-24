'use strict'

import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {mergeDeep} from "./DataHelper";
import {logRegular} from "./LoggerHelper";
import {TemplateHelper} from "./TemplateHelper";
import {AttachmentBuilder, Embed} from "discord.js";

export class EmbedHelper {

    public loadCache() {
        logRegular("load Embeds Cache...")
        const localeHelper = new LocaleHelper()
        const configHelper = new ConfigHelper()
        const embedMeta = configHelper.getEmbedMeta()
        const embeds = embedMeta
        const embedsLocale = localeHelper.getEmbeds()

        mergeDeep(embeds, embedsLocale)

        setData('embeds', embeds)
    }

    public getEmbeds() {
        return getEntry('embeds')
    }

    public getFields() {
        return getEntry('embeds').fields
    }

    public getRawEmbedByTitle(title: string) {
        const embeds = this.getEmbeds()
        for (const embedID in embeds) {
            const embedData = embeds[embedID]
            if (embedData.title === title) {
                return {embedID, embedData}
            }
        }
    }

    public getAuthorName(embed: Embed) {
        if (embed.author === null) {
            return ''
        }

        return embed.author.name
    }

    public getTitle(embed: Embed) {
        if (embed.title === null) {
            return ''
        }

        return embed.title
    }

    public async generateEmbed(embedID: string, providedPlaceholders = null, providedFields = null, providedValues = null) {
        return await new TemplateHelper().parseTemplate('embed', embedID, providedPlaceholders, providedFields, providedValues)
    }
}