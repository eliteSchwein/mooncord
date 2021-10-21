import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {findValue} from "../utils/CacheUtil";

export class EmbedHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected embeds = this.localeHelper.getEmbeds()
    protected fields = this.embeds.fields

    public generateEmbed(embedID: string,providedPlaceholders = null) {
        console.log(this.embeds[embedID])
        let embedRaw = JSON.stringify(this.embeds[embedID])
        const placeholders = embedRaw.match(/(\${).*?}/g)

        for(const placeholder of placeholders) {
            embedRaw = embedRaw.replace(placeholder, this.parsePlaceholder(placeholder,providedPlaceholders))
        }

        const embedData = JSON.parse(embedRaw)
        console.log(placeholders)
    }
    protected parsePlaceholder(placeholder: string,providedPlaceholders = null) {
        const placeholderId = placeholder
            .replace(/(\${)/g,'')
            .replace(/}/g,'')

        if(providedPlaceholders !== null) {
            const providedParser = providedPlaceholders[placeholderId]
            if(typeof providedParser !== 'undefined') {
                return providedParser
            }
        }
        
        const cacheParser = findValue(placeholderId)

        if(typeof cacheParser !== 'undefined') { return cacheParser }

        return ""
    }
}