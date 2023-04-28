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
import {PowerDeviceHelper} from "./PowerDeviceHelper";
import {HistoryHelper} from "./HistoryHelper";

export class TemplateHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()
    protected tempHelper = new TempHelper()
    protected versionHelper = new VersionHelper()
    protected graphHelper = new GraphHelper()
    protected powerDeviceHelper = new PowerDeviceHelper()
    protected webcamHelper = new WebcamHelper()
    protected historyHelper = new HistoryHelper()

    public parseRawTemplate(type: string, id: string) {
        const unformattedData = Object.assign({}, getEntry(`${type}s`)[id])
        const partials = unformattedData.partials

        if(unformattedData.fields === undefined) {
            unformattedData.fields = []
        }

        if(unformattedData.partials !== undefined) {
            unformattedData.fields = this.parsePartials(partials, unformattedData.fields)
        }

        if (unformattedData.buttons) {
            unformattedData.buttons = this.getInputData('buttons', unformattedData.buttons)
        }

        if (unformattedData.select_menus) {
            unformattedData.selections = this.getInputData('selections', unformattedData.select_menus)
            delete unformattedData.select_menus
        }

        if (unformattedData.textinputs) {
            unformattedData.inputs = this.getInputData('inputs', unformattedData.textinputs)
            delete unformattedData.textinputs
        }

        if (unformattedData.add_temp_inputs) {
            // @ts-ignore
            const rawTempInputData = this.getInputData('inputs', ['temp_target_input'])[0]
            const heaters = this.tempHelper.getHeaters()

            for (const heater of heaters) {
                const heaterInput = Object.assign({}, rawTempInputData)
                heaterInput.id = heater
                heaterInput.value = this.tempHelper.getHeaterTarget(heater)
                heaterInput.label = heaterInput.label.replace(/\${heater}/g, heater)
                unformattedData.inputs.push(heaterInput)
            }
        }

        return unformattedData
    }

    protected parsePartials(partials: any[], fields: any[]) {
        if (partials.includes('versions')) {
            fields = [...fields, ...this.versionHelper.getFields()]
        }

        if (partials.includes('updates')) {
            fields = [...fields, ...this.versionHelper.getUpdateFields()]
        }

        if (partials.includes('temps')) {
            fields = [...fields, ...this.tempHelper.parseFields().fields]
        }

        if (partials.includes('minimal_temp')) {
            fields = [...fields, ...this.tempHelper.parseFields(true).fields]
        }

        if (partials.includes('print_history')) {
            fields = [...fields, ...this.historyHelper.parseFields()]
        }

        if (partials.includes('power_devices')) {
            fields = [...fields, ...this.powerDeviceHelper.parseFields()]
        }

        return fields
    }

    public async parseTemplate(type: string, id: string, providedPlaceholders = null, providedFields = null, providedValues = null) {
        let messageObject = null

        switch (type) {
            case 'modal':
                messageObject = new Modal()
                break
            case 'embed':
                messageObject = new MessageEmbed()
                break
        }

        if (messageObject === null) {
            return false
        }

        const unformattedData = this.parseRawTemplate(type, id)

        if (providedFields !== null) {
            mergeDeep(unformattedData, {fields: providedFields})
        }

        if (providedValues !== null) {
            mergeDeep(unformattedData, providedValues)
        }

        let messageObjectRaw = JSON.stringify(unformattedData)

        const placeholders = messageObjectRaw.matchAll(/(\${).*?}/g)
        let files = []
        let components = []
        const response = {
            embeds: undefined,
            content: null
        }

        if (placeholders !== null) {
            for (const placeholder of placeholders) {
                const placeholderId = String(placeholder).match(/(\${).*?}/g)[0]
                const placeholderContent = this.parsePlaceholder(placeholderId, providedPlaceholders)

                if (placeholderContent.content === null || placeholderContent.content === '') {
                    continue
                }

                if (placeholderContent.content === '$clear') {
                    placeholderContent.content = ''
                }

                if (!placeholderContent.double_dash) {
                    const startPos = messageObjectRaw.indexOf(placeholderId)
                    const endPos = startPos + placeholderId.length
                    messageObjectRaw = messageObjectRaw.slice(0, startPos - 1) +
                        placeholderContent.content +
                        messageObjectRaw.slice(endPos + 1)
                } else {
                    messageObjectRaw = messageObjectRaw.replace(placeholderId, placeholderContent.content)
                }
            }
        }

        const messageObjectData = JSON.parse(messageObjectRaw)

        const thumbnail = await this.parseImage(messageObjectData.thumbnail)
        const image = await this.parseImage(messageObjectData.image)
        const buttons = this.inputGenerator.generateButtons(messageObjectData.buttons)
        const selections = this.inputGenerator.generateSelections(messageObjectData.selections)
        const inputs = this.inputGenerator.generateInputs(messageObjectData.inputs)

        console.log(messageObjectData)

        for(const selectionId in selections) {
            components.push(selections[selectionId])
        }
        components.push(buttons)
        components.push(inputs)

        files = files.filter((element) => {
            return element != null
        })
        components = components.filter((element) => {
            return element != null
        })

        messageObject.setTitle(messageObjectData.title)

        if (typeof messageObjectData.color !== 'undefined') {
            messageObject.setColor(messageObjectData.color)
        }

        if (typeof messageObjectData.description !== 'undefined') {
            messageObject.setDescription(messageObjectData.description)
        }

        if (typeof messageObjectData.author !== 'undefined') {
            messageObject.setAuthor({'name': messageObjectData.author})
        }

        if (typeof messageObjectData.footer !== 'undefined') {
            messageObject.setFooter({'text': messageObjectData.footer})
        }

        if (messageObjectData.content !== undefined) {
            response.content = messageObjectData.content
        }

        if (typeof thumbnail === 'object') {
            files.push(thumbnail)
            messageObject.setThumbnail(`attachment://${thumbnail.name}`)
        }

        if (typeof image === 'object') {
            files.push(image)
            messageObject.setImage(`attachment://${image.name}`)
        }

        if (typeof thumbnail === 'string') {
            messageObject.setThumbnail(thumbnail)
        }

        if (typeof image === 'string') {
            messageObject.setImage(image)
        }

        const fields = []

        if (typeof messageObjectData.fields !== 'undefined') {
            messageObjectData.fields.forEach(field => {
                if (field.name === '') {
                    field.name = 'N/A'
                }
                if (field.value === '') {
                    field.value = 'N/A'
                }
                if (field.name === ' ') {
                    field.name = 'N/A'
                }
                if (field.value === ' ') {
                    field.value = 'N/A'
                }
                fields.push({
                    'name': field.name,
                    'value': field.value,
                    'inline': true
                })
            })
        }

        if (fields.length > 0) {
            messageObject.addFields(fields)
        }

        response.embeds = [messageObject]
        response['components'] = components
        response['files'] = files

        switch (type) {
            case 'embed':
                return {embed: response, activity: messageObjectData.activity}
            case 'modal':
                messageObject.setCustomId(id)
                messageObject.addComponents(components)
                return messageObject
        }
    }

    public getInputData(type: string, data: []) {
        const inputData = []
        const metaData = Object.assign({}, getEntry(type))

        for (const inputId of data) {
            console.log(inputId)
            const inputMetaData = metaData[inputId]
            console.log(inputMetaData)
            inputMetaData.id = inputId
            inputData.push(inputMetaData)
        }

        return inputData
    }

    protected parsePlaceholder(placeholder: string, providedPlaceholders = null) {
        const placeholderId = placeholder
            .replace(/(\${)/g, '')
            .replace(/}/g, '')

        if (providedPlaceholders !== null) {
            const providedParser = providedPlaceholders[placeholderId]
            if (typeof providedParser !== 'undefined') {
                if (typeof providedParser === 'object') {
                    return {
                        'content': JSON.stringify(providedParser),
                        'double_dash': false
                    }
                }
                if (typeof providedParser !== 'string') {
                    return {
                        'content': providedParser,
                        'double_dash': true
                    }
                }
                return {
                    'content': providedParser
                        .replace(/(")/g, '\'')
                        .replace(/(\n)/g, '\\n'),
                    'double_dash': true
                }
            }
        }

        let cacheParser = findValue(placeholderId)

        if (placeholderId.includes(':')) {
            const templateFragments = placeholderId.split(':')
            cacheParser = parseCalculatedPlaceholder(templateFragments)
        }

        if (placeholderId === 'state_message') {
            cacheParser = this.getStateMessage()
        }

        if (cacheParser === undefined || cacheParser === null) {
            return {
                'content': '',
                'double_dash': true
            }
        }

        if (cacheParser.constructor.name === 'Array') {
            cacheParser = cacheParser.join('\\n')
        }

        cacheParser = String(cacheParser)

        if (cacheParser === '') {
            cacheParser = 'N/A'
        }

        return {
            'content': cacheParser
                .replace(/(")/g, '\'')
                .replace(/(\n)/g, '\\n'),
            'double_dash': true
        }
    }

    protected getStateMessage() {
        const webhookState = findValue('state.webhooks.state')
        const webhookStateMessage = findValue('state.webhooks.state_message')
        const state = findValue('function.current_status')
        const printerInfoStateMessage = findValue('printer_info.state_message')
        const printStatsMessage = findValue('state.print_stats.message')

        if (webhookState === state) {
            return webhookStateMessage
        }

        if (printerInfoStateMessage === 'Printer is ready') {
            return printStatsMessage
        }

        return printerInfoStateMessage
    }

    protected async parseImage(imageID: string) {
        const metadataHelper = new MetadataHelper()
        if (typeof imageID === 'undefined') {
            return
        }

        if (imageID.startsWith('http')) {
            return imageID
        }

        if (imageID === 'webcam') {
            return this.webcamHelper.retrieveWebcam(app.getMoonrakerClient())
        }

        if (imageID === 'thumbnail') {
            return metadataHelper.getThumbnail(findValue('state.print_stats.filename'))
        }

        if (imageID === 'tempGraph') {
            return await this.graphHelper.getTempGraph()
        }

        if (imageID === 'historyGraph') {
            return await this.graphHelper.getHistoryGraph()
        }

        if (imageID === 'excludeGraph') {
            return await this.graphHelper.getExcludeGraph(undefined)
        }

        const imagePath = path.resolve(__dirname, `../assets/icon-sets/${this.configHelper.getIconSet()}/${imageID}`)
        return new MessageAttachment(imagePath, imageID)
    }
}