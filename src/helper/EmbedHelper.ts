import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {findValue, getEntry, setData} from "../utils/CacheUtil";
import {MessageAttachment, MessageEmbed} from "discord.js";
import * as path from "path"
import * as app from "../Application"
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {formatPercent, mergeDeep, parseCalculatedPlaceholder} from "./DataHelper";
import {logRegular} from "./LoggerHelper";
import {WebcamHelper} from "./WebcamHelper";
import { VersionHelper } from "./VersionHelper";
import { TempHelper } from "./TempHelper";
import {MetadataHelper} from "./MetadataHelper";

export class EmbedHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()
    protected webcamHelper = new WebcamHelper()
    protected embedMeta = this.configHelper.getEmbedMeta()
    protected tempHelper = new TempHelper()
    protected versionHelper = new VersionHelper()

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

    public getRawEmbedByTitle(title:string) {
        const embeds = this.getEmbeds()
        for(const embedID in embeds) {
            const embedData = embeds[embedID]
            if(embedData.title === title) {
                return {embedID, embedData}
            }
        }
    }

    public async generateEmbed(embedID: string,providedPlaceholders = null, providedFields = null) {
        const embed = new MessageEmbed()
        const embedDataUnformatted = { ...this.getEmbeds()[embedID]}

        if(embedDataUnformatted.show_versions) {
            embedDataUnformatted.fields = [...embedDataUnformatted.fields, ...this.versionHelper.getFields()]
        }

        if(embedDataUnformatted.show_updates) {
            embedDataUnformatted.fields = [...embedDataUnformatted.fields, ...this.versionHelper.getUpdateFields()]
        }

        if(embedDataUnformatted.show_temps) {
            embedDataUnformatted.fields = [...embedDataUnformatted.fields, ...this.tempHelper.parseFields().fields]
        }

        if(providedFields !== null) {
            mergeDeep(embedDataUnformatted, {fields: providedFields})
        }

        let embedRaw = JSON.stringify(embedDataUnformatted)

        const placeholders = embedRaw.matchAll(/(\${).*?}/g)
        let files = []
        let components = []
        const response = {
            embeds: undefined
        }

        if(placeholders !== null) {
            for(const placeholder of placeholders) {
                const placeholderContent = this.parsePlaceholder(placeholder[0],providedPlaceholders)
                if(!placeholderContent.double_dash) {
                    const endPos = placeholder.index + placeholder[0].length
                    embedRaw = embedRaw.slice(0,placeholder.index-1) +
                        placeholderContent.content +
                        embedRaw.slice(endPos+1)
                } else {
                    embedRaw = embedRaw.replace(placeholder[0], placeholderContent.content)
                }
            }
        }

        const embedData = JSON.parse(embedRaw)

        const thumbnail = await this.parseImage(embedData.thumbnail)
        const image = await this.parseImage(embedData.image)
        const buttons = this.inputGenerator.generateButtons(embedData.buttons)
        const selection = this.inputGenerator.generateSelection(embedData.selection)

        files.push(thumbnail, image)

        components.push(selection)
        components.push(buttons)

        files = files.filter((element) => { return element != null})
        components = components.filter((element) => { return element != null})

        embed.setTitle(embedData.title)
        embed.setColor(embedData.color)

        if(typeof embedData.description !== 'undefined') {
            embed.setDescription(embedData.description)
        }

        if(typeof embedData.author !== 'undefined') {
            embed.setAuthor(embedData.author)
        }

        if(typeof embedData.footer !== 'undefined') {
            embed.setFooter(embedData.footer)
        }

        if(typeof thumbnail !== 'undefined') {
            embed.setThumbnail(`attachment://${thumbnail.name}`)
        }

        if(typeof image !== 'undefined') {
            embed.setImage(`attachment://${image.name}`)
        }

        if(typeof embedData.fields !== 'undefined') {
            embedData.fields.forEach(field => {
                if(field.name === '') {field.name = 'N/A'}
                if(field.value === '') {field.value = 'N/A'}
                embed.addField(field.name, field.value, true)
            })
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
        const metadataHelper = new MetadataHelper()
        if(typeof imageID === 'undefined') { return }
        
        if(imageID === 'webcam') {
            return this.webcamHelper.retrieveWebcam(app.getMoonrakerClient())
        }
        
        if(imageID === 'thumbnail') {
            return metadataHelper.getThumbnail(findValue('state.print_stats.filename'))
        }

        const imagePath = path.resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/${imageID}`)
        return new MessageAttachment(imagePath, imageID)
    }
    protected parsePlaceholder(placeholder: string,providedPlaceholders = null) {
        const placeholderId = placeholder
            .replace(/(\${)/g,'')
            .replace(/}/g,'')

        if(providedPlaceholders !== null) {
            const providedParser = providedPlaceholders[placeholderId]
            if(typeof providedParser !== 'undefined') {
                if(typeof providedParser === 'object') {
                    return {
                        'content': JSON.stringify(providedParser),
                        'double_dash': false
                    }
                }
                if(typeof providedParser !== 'string') {
                    return {
                        'content': providedParser,
                        'double_dash': true
                    }
                }
                return {
                    'content': providedParser
                        .replace(/(")/g,'\'')
                        .replace(/(\n)/g,'\\n'),
                    'double_dash': true
                }
            }
        }
        
        let cacheParser = findValue(placeholderId)

        if(placeholderId.includes(':')) {
            const templateFragments = placeholderId.split(':')
            cacheParser = parseCalculatedPlaceholder(templateFragments)
        }

        if(placeholderId === 'state_message') {
            cacheParser = this.getStateMessage()
        }

        if(typeof cacheParser === 'undefined') {
            return {
                'content': '',
                'double_dash': true
            }
        }

        cacheParser = String(cacheParser)

        return {
            'content': cacheParser
                .replace(/(")/g,'\'')
                .replace(/(\n)/g,'\\n'),
            'double_dash': true
        }
    }

    protected getStateMessage() {
        const webhookState = findValue('state.webhooks.state')
        const webhookStateMessage = findValue('state.webhooks.state_message')
        const state = findValue('function.current_status')
        const printerInfoStateMessage = findValue('printer_info.state_message')

        if(webhookState === state) {
            return webhookStateMessage
        }

        return printerInfoStateMessage
    }
}