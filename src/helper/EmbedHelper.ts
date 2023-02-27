import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {MessageEmbed} from "discord.js";
import {mergeDeep} from "./DataHelper";
import {logRegular} from "./LoggerHelper";
import {TemplateHelper} from "./TemplateHelper";

export class EmbedHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected embedMeta = this.configHelper.getEmbedMeta()
    protected templateHelper = new TemplateHelper()

    public loadCache() {
        logRegular("load Embeds Cache...")
        const embeds = this.embedMeta
        const embedsLocale = this.localeHelper.getEmbeds()

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

    public getAuthorName(embed: MessageEmbed) {
        if (embed.author === null) {
            return ''
        }

        return embed.author.name
    }

    public getTitle(embed: MessageEmbed) {
        if (embed.title === null) {
            return ''
        }

        return embed.title
    }

    public async generateEmbed(embedID: string, providedPlaceholders = null, providedFields = null, providedValues = null) {
        return await this.templateHelper.parseTemplate('embed', embedID, providedPlaceholders, providedFields, providedValues)
    }
}