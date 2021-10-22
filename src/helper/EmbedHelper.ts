import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {findValue, getEntry, setData} from "../utils/CacheUtil";
import embedMapping from "../meta/embed_mapping.json"
import {MessageAttachment, MessageEmbed} from "discord.js";
import * as path from "path"
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {mergeDeep} from "./ObjectMergeHelper";
import {logRegular} from "./ConsoleLogger";

export class EmbedHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()

    public loadCache() {
        logRegular("load Embeds Cache...")
        const embeds = embedMapping
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

    public generateEmbed(embedID: string,providedPlaceholders = null, providedFields = null) {
        const embed = new MessageEmbed()
        const embedDataUnformatted = this.getEmbeds()[embedID]

        if(providedFields !== null) {
            mergeDeep(embedDataUnformatted, {fields: providedFields})
        }

        let embedRaw = JSON.stringify(embedDataUnformatted)

        const placeholders = embedRaw.match(/(\${).*?}/g)
        const files = []
        const components = []
        const response = {
            embeds: undefined
        }

        for(const placeholder of placeholders) {
            embedRaw = embedRaw.replace(placeholder, this.parsePlaceholder(placeholder,providedPlaceholders))
        }

        const embedData = JSON.parse(embedRaw)

        const thumbnail = this.parseThumbnail(embedData.thumbnail)
        const buttons = this.inputGenerator.generateButtons(embedData.buttons)

        files.push(thumbnail)

        components.push(buttons)

        embed.setTitle(embedData.title)
        embed.setColor(embedData.color)

        if(typeof embedData.description !== 'undefined') {
            embed.setDescription(embedData.description)
        }

        if(typeof thumbnail !== 'undefined') {
            embed.setThumbnail(`attachment://${thumbnail.name}`)
        }

        if(typeof embedData.fields !== 'undefined') {
            embed.setFields(embedData.fields)
        }

        response.embeds = [embed]

        if(typeof components[0] !== 'undefined') {
            response['components'] = components
        }

        if(typeof files[0] !== 'undefined') {
            response['files'] = files
        }

        return response
    }
    protected parseThumbnail(thumbnailID: string) {
        if(typeof thumbnailID === 'undefined') { return }

        const thumbnailPath = path.resolve(__dirname, `../assets/images/${thumbnailID}`)
        return new MessageAttachment(thumbnailPath, thumbnailID)
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