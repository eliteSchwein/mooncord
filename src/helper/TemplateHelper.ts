import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {MessageAttachment, MessageEmbed, Modal} from "discord.js";
import {findValue, getEntry} from "../utils/CacheUtil";
import {mergeDeep, parseCalculatedPlaceholder} from "./DataHelper";
import {TempHelper} from "./TempHelper";
import {VersionHelper} from "./VersionHelper";
import {GraphHelper} from "./GraphHelper";
import {MetadataHelper} from "./MetadataHelper";
import * as app from "../Application";
import path from "path";
import {WebcamHelper} from "./WebcamHelper";

export class TemplateHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()
    protected tempHelper = new TempHelper()
    protected versionHelper = new VersionHelper()
    protected graphHelper = new GraphHelper()
    protected webcamHelper = new WebcamHelper()

    public async parseTemplate(type: string, id: string,providedPlaceholders = null, providedFields = null, providedValues = null) {
        let messageObject = null

        switch (type) {
            case 'modal':
                messageObject = new Modal()
                break
            case 'embed':
                messageObject = new MessageEmbed()
                break
        }

        if(messageObject === null) {
            return false
        }

        const unformattedData = getEntry(`${type}s`)[id]

        if(unformattedData.show_versions) {
            unformattedData.fields = [...unformattedData.fields, ...this.versionHelper.getFields()]
        }

        if(unformattedData.show_updates) {
            unformattedData.fields = [...unformattedData.fields, ...this.versionHelper.getUpdateFields()]
        }

        if(unformattedData.show_temps) {
            unformattedData.fields = [...unformattedData.fields, ...this.tempHelper.parseFields().fields]
        }

        if(providedFields !== null) {
            mergeDeep(unformattedData, {fields: providedFields})
        }

        if(providedValues !== null) {
            mergeDeep(unformattedData, providedValues)
        }

        let messageObjectRaw = JSON.stringify(unformattedData)

        const placeholders = messageObjectRaw.matchAll(/(\${).*?}/g)
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
                    messageObjectRaw = messageObjectRaw.slice(0,placeholder.index-1) +
                        placeholderContent.content +
                        messageObjectRaw.slice(endPos+1)
                } else {
                    messageObjectRaw = messageObjectRaw.replace(placeholder[0], placeholderContent.content)
                }
            }
        }

        const messageObjectData = JSON.parse(messageObjectRaw)

        const thumbnail = await this.parseImage(messageObjectData.thumbnail)
        const image = await this.parseImage(messageObjectData.image)
        const buttons = this.inputGenerator.generateButtons(messageObjectData.buttons)
        const selection = this.inputGenerator.generateSelection(messageObjectData.selection)
        const inputs = this.inputGenerator.generateInputs(messageObjectData.inputs)

        components.push(selection)
        components.push(buttons)
        components.push(inputs)

        files = files.filter((element) => { return element != null})
        components = components.filter((element) => { return element != null})

        messageObject.setTitle(messageObjectData.title)

        if(typeof messageObjectData.color !== 'undefined') {
            messageObject.setColor(messageObjectData.color)
        }

        if(typeof messageObjectData.description !== 'undefined') {
            messageObject.setDescription(messageObjectData.description)
        }

        if(typeof messageObjectData.author !== 'undefined') {
            messageObject.setAuthor({'name': messageObjectData.author})
        }

        if(typeof messageObjectData.footer !== 'undefined') {
            messageObject.setFooter({'text': messageObjectData.footer})
        }

        if(typeof thumbnail === 'object') {
            files.push(thumbnail)
            messageObject.setThumbnail(`attachment://${thumbnail.name}`)
        }

        if(typeof image === 'object') {
            files.push(image)
            messageObject.setImage(`attachment://${image.name}`)
        }

        if(typeof thumbnail === 'string') {
            messageObject.setThumbnail(thumbnail)
        }

        if(typeof image === 'string') {
            messageObject.setImage(image)
        }

        if(typeof messageObjectData.fields !== 'undefined') {
            messageObjectData.fields.forEach(field => {
                if(field.name === '') {field.name = 'N/A'}
                if(field.value === '') {field.value = 'N/A'}
                if(field.name === ' ') {field.name = 'N/A'}
                if(field.value === ' ') {field.value = 'N/A'}
                messageObject.addField(field.name, field.value, true)
            })
        }

        response.embeds = [messageObject]

        if(components.length > 0) {
            response['components'] = components
        }

        if(files.length > 0) {
            response['files'] = files
        }

        switch (type) {
            case 'embed':
                return {embed: response, activity: messageObjectData.activity}
            case 'modal':
                messageObject.setCustomId(id)
                messageObject.addComponents(components)
                return messageObject
        }
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

    protected async parseImage(imageID: string) {
        const metadataHelper = new MetadataHelper()
        if(typeof imageID === 'undefined') { return }

        if(imageID === 'webcam') {
            return this.webcamHelper.retrieveWebcam(app.getMoonrakerClient())
        }

        if(imageID === 'thumbnail') {
            return metadataHelper.getThumbnail(findValue('state.print_stats.filename'))
        }

        if(imageID === 'tempGraph') {
            return await this.graphHelper.getTempGraph()
        }

        const imagePath = path.resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/${imageID}`)
        return new MessageAttachment(imagePath, imageID)
    }
}