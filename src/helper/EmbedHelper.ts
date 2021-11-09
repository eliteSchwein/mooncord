import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {findValue, getEntry, setData} from "../utils/CacheUtil";
import embedMapping from "../meta/embed_mapping.json"
import {MessageAttachment, MessageEmbed} from "discord.js";
import * as path from "path"
import * as app from "../Application"
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {mergeDeep} from "./DataHelper";
import {logRegular} from "./LoggerHelper";
import {WebcamHelper} from "./WebcamHelper";

export class EmbedHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()
    protected webcamHelper = new WebcamHelper()

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

    public async generateEmbed(embedID: string,providedPlaceholders = null, providedFields = null) {
        const embed = new MessageEmbed()
        const embedDataUnformatted = this.getEmbeds()[embedID]

        if(providedFields !== null) {
            mergeDeep(embedDataUnformatted, {fields: providedFields})
        }

        let embedRaw = JSON.stringify(embedDataUnformatted)

        const placeholders = embedRaw.match(/(\${).*?}/g)
        let files = []
        let components = []
        const response = {
            embeds: undefined
        }

        if(placeholders !== null) {
            for(const placeholder of placeholders) {
                embedRaw = embedRaw.replace(placeholder, this.parsePlaceholder(placeholder,providedPlaceholders))
            }
        }

        const embedData = JSON.parse(embedRaw)

        const thumbnail = await this.parseImage(embedData.thumbnail)
        const image = await this.parseImage(embedData.image)
        const buttons = this.inputGenerator.generateButtons(embedData.buttons)

        files.push(thumbnail, image)

        components.push(buttons)

        files = files.filter((element) => { return element != null})
        components = components.filter((element) => { return element != null})

        embed.setTitle(embedData.title)
        embed.setColor(embedData.color)

        if(typeof embedData.description !== 'undefined') {
            embed.setDescription(embedData.description)
        }

        if(typeof thumbnail !== 'undefined') {
            embed.setThumbnail(`attachment://${thumbnail.name}`)
        }

        if(typeof image !== 'undefined') {
            embed.setImage(`attachment://${image.name}`)
        }

        if(typeof embedData.fields !== 'undefined') {
            embed.setFields(embedData.fields)
        }

        response.embeds = [embed]

        if(components.length > 0) {
            response['components'] = components
        }

        if(files.length > 0) {
            response['files'] = files
        }

        return {embed: response, activity: embedData.activity}
    }
    protected async parseImage(imageID: string) {
        if(typeof imageID === 'undefined') { return }
        
        if(imageID === 'webcam') {
            return this.webcamHelper.retrieveWebcam(app.getMoonrakerClient())
        }

        const imagePath = path.resolve(__dirname, `../assets/images/${imageID}`)
        return new MessageAttachment(imagePath, imageID)
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

        if(typeof cacheParser === 'undefined') { return "" }

        return cacheParser
            .replace(/(")/g,'\'')
            .replace(/(\n)/g,'\\n')
    }
}