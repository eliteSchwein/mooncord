'use strict'

import {ConfigHelper} from "./ConfigHelper";
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {findValue, getEntry} from "../utils/CacheUtil";
import {mergeDeep, parseFunctionPlaceholders} from "./DataHelper";
import {TempHelper} from "./TempHelper";
import {VersionHelper} from "./VersionHelper";
import {MetadataHelper} from "./MetadataHelper";
import path, {resolve} from "path";
import {WebcamHelper} from "./WebcamHelper";
import {PowerDeviceHelper} from "./PowerDeviceHelper";
import {HistoryHelper} from "./HistoryHelper";
import HistoryGraph from "./graphs/HistoryGraph";
import TempHistoryGraph from "./graphs/TempHistoryGraph";
import {ExcludeGraph} from "./graphs/ExcludeGraph";
import {SpoolmanHelper} from "./SpoolmanHelper";
import {existsSync} from "fs";
import {logWarn} from "./LoggerHelper";
import {AttachmentBuilder, EmbedBuilder, ModalBuilder} from "discord.js";
import {get} from "lodash";
import PageListGraph from "./graphs/PageListGraph";

export class TemplateHelper {
    protected parsedPlaceholders = []

    public async parseRawTemplate(type: string, id: string) {
        const unformattedData = Object.assign({}, getEntry(`${type}s`)[id])
        const partials = unformattedData.partials
        const tempHelper = new TempHelper()

        if (unformattedData.field === undefined) {
            unformattedData.field = []
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

        if (unformattedData.partials !== undefined) {
            unformattedData.field = await this.parsePartials(partials, unformattedData.field)

            if (unformattedData.partials.includes('temp_inputs')) {
                // @ts-ignore
                const rawTempInputData = this.getInputData('inputs', ['temp_target_input'])[0]
                const heaters = tempHelper.getHeaters()

                if (unformattedData.inputs === undefined) {
                    unformattedData.inputs = []
                }

                for (const heater of heaters) {
                    const heaterInput = Object.assign({}, rawTempInputData)
                    heaterInput.id = heater
                    heaterInput.value = tempHelper.getHeaterTarget(heater)
                    heaterInput.label = heaterInput.label.replace(/\${heater}/g, heater)
                    unformattedData.inputs.push(heaterInput)
                }
            }
        }

        return unformattedData
    }

    public async parseTemplate(type: string, id: string, providedPlaceholders = null, providedFields = null, providedValues = null) {
        let messageObject = null

        switch (type) {
            case 'modal':
                messageObject = new ModalBuilder()
                break
            case 'embed':
                messageObject = new EmbedBuilder()
                break
        }

        if (messageObject === null) {
            return false
        }

        const unformattedData = await this.parseRawTemplate(type, id)

        if (providedFields !== null) {
            mergeDeep(unformattedData, {field: providedFields})
        }

        if (providedValues !== null) {
            mergeDeep(unformattedData, providedValues)
        }

        let messageObjectRaw = JSON.stringify(unformattedData)

        let files = []
        let components = []
        const response = {
            embeds: undefined,
            content: null
        }

        messageObjectRaw = await this.parsePlaceholder(messageObjectRaw, providedPlaceholders)

        const messageObjectData = JSON.parse(messageObjectRaw)

        const inputGenerator = new DiscordInputGenerator()

        const thumbnail = await this.parseImage(messageObjectData.thumbnail, messageObjectData)
        const image = await this.parseImage(messageObjectData.image, messageObjectData)
        const footerIcon = await this.parseImage(messageObjectData.footer_icon, messageObjectData)
        const buttons = inputGenerator.generateButtons(messageObjectData.buttons, unformattedData['buttons_per_row'])
        const selections = inputGenerator.generateSelections(messageObjectData.selections)
        const inputs = inputGenerator.generateInputs(messageObjectData.inputs)

        for (const selectionId in selections) {
            components.push(selections[selectionId])
        }

        for (const rowId in buttons) {
            components.push(buttons[rowId])
        }

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
            const footerObject: any = {'text': messageObjectData.footer}

            if (typeof footerIcon === 'string')
                footerObject.iconURL = footerIcon

            messageObject.setFooter(footerObject)
        }

        if (messageObjectData.timestamp)
            messageObject.setTimestamp()

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

        const field = []

        if (typeof messageObjectData.field !== 'undefined') {
            messageObjectData.field.forEach(fieldEntry => {
                if (fieldEntry.name === '') {
                    fieldEntry.name = 'N/A'
                }
                if (fieldEntry.value === '') {
                    fieldEntry.value = 'N/A'
                }
                if (fieldEntry.name === ' ') {
                    fieldEntry.name = 'N/A'
                }
                if (fieldEntry.value === ' ') {
                    fieldEntry.value = 'N/A'
                }
                field.push({
                    'name': fieldEntry.name,
                    'value': fieldEntry.value,
                    'inline': true
                })
            })
        }

        if (field.length > 0) {
            messageObject.addFields(field)
        }

        response.embeds = [messageObject]
        response['components'] = components
        response['files'] = files

        switch (type) {
            case 'embed':
                return {embed: response, activity: messageObjectData.activity}
            case 'modal':
                messageObject.setCustomId(id)
                messageObject.addComponents(...components)
                return messageObject
        }
    }

    public getInputData(type: string, data: any[]) {
        const inputData = []
        const metaData = Object.assign({}, getEntry(type))

        for (const inputId of data) {
            const inputMetaData = metaData[inputId]
            inputMetaData.id = inputId
            inputData.push(inputMetaData)
        }

        return inputData
    }

    private async parseSinglePlaceholder(placeholder: any, providedPlaceholders = null) {
        const placeholderId = String(placeholder).match(/(\${).*?}/g)[0]
        const placeholderContent = await this.parsePlaceholderContent(placeholderId, providedPlaceholders)

        if (placeholderContent.content === null || placeholderContent.content === '') {
            return
        }

        if (placeholderContent.content === '$clear') {
            placeholderContent.content = ''
        }

        this.parsedPlaceholders.push({
            id: placeholderId,
            content: placeholderContent,
        })
    }

    public async parsePlaceholder(input: string, providedPlaceholders = null) {
        const placeholders = input.matchAll(/(\${).*?}/g)
        this.parsedPlaceholders = []

        if (placeholders !== null) {
            const promises = []

            for (const placeholder of placeholders) {
                promises.push(this.parseSinglePlaceholder(placeholder, providedPlaceholders))
            }

            await Promise.all(promises)

            for (const placeholder of this.parsedPlaceholders) {
                if (!placeholder.content.double_dash) {
                    const startPos = input.indexOf(placeholder.id)
                    const endPos = startPos + placeholder.id.length
                    input = input.slice(0, startPos - 1) +
                        placeholder.content.content +
                        input.slice(endPos + 1)
                } else {
                    input = input.replace(placeholder.id, placeholder.content.content)
                }
            }
        }

        return input
    }

    private async parsePartials(partials: any[], field: any[]) {
        const spoolmanHelper = new SpoolmanHelper()
        const tempHelper = new TempHelper()
        const versionHelper = new VersionHelper()

        if (partials.includes('versions')) {
            field = [...field, ...versionHelper.getFields()]
        }

        if (partials.includes('spoolman')) {
            const newFields = await spoolmanHelper.getFields()
            field = [...field, ...newFields]
        }

        if (partials.includes('updates')) {
            field = [...field, ...versionHelper.getUpdateFields()]
        }

        if (partials.includes('temp') || partials.includes('temps')) {
            field = [...field, ...tempHelper.parseFields().fields]
        }

        if (partials.includes('minimal_temp') || partials.includes('minimal_temps')) {
            field = [...field, ...tempHelper.parseFields(true).fields]
        }

        if (partials.includes('print_history')) {
            field = [...field, ...new HistoryHelper().parseFields()]
        }

        if (partials.includes('power_devices')) {
            field = [...field, ...new PowerDeviceHelper().parseFields()]
        }

        return field
    }

    private async parsePlaceholderContent(placeholder: string, providedPlaceholders = null) {
        const placeholderId = placeholder
            .replace(/(\${)/g, '')
            .replace(/}/g, '')

        if (placeholderId === 'current_timestamp') {
            return {
                'content': `${Date.now()}`,
                'double_dash': true
            }
        }

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

            for (const index in templateFragments) {
                const templateFragment = templateFragments[index]

                const cacheMatch = findValue(templateFragment)
                let providedMatch = undefined

                if (providedPlaceholders) {
                    providedMatch = get(providedPlaceholders, templateFragment)
                }

                if (cacheMatch) {
                    templateFragments[index] = cacheMatch
                }

                if (providedMatch) {
                    templateFragments[index] = providedMatch
                }
            }

            cacheParser = await parseFunctionPlaceholders(templateFragments)
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

    private getStateMessage() {
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

    private async parseImage(imageID: string, messageObjectData: any) {
        const metadataHelper = new MetadataHelper()

        if (typeof imageID === 'undefined') {
            return
        }

        if (imageID.startsWith('http')) {
            return imageID
        }

        if (imageID === 'placeholder') {
            return new AttachmentBuilder(
                resolve(__dirname, `../assets/placeholder.png`),
                {name: 'placeholder.png'}
            )
        }

        if (imageID === 'webcam') {
            return new WebcamHelper().retrieveWebcam()
        }

        if (imageID === 'placeholderWebcam') {
            return new WebcamHelper().getFallbackImage()
        }

        if (imageID === 'thumbnail') {
            return metadataHelper.getThumbnail(findValue('state.print_stats.filename'))
        }

        if (imageID === 'tempGraph') {
            return await new TempHistoryGraph().renderGraph()
        }

        if (imageID === 'historyGraph') {
            return await new HistoryGraph().renderGraph()
        }

        if (imageID === 'excludeGraph') {
            return await new ExcludeGraph().renderGraph()
        }

        if (imageID === 'pageGraph') {
            return await new PageListGraph().renderGraph(messageObjectData)
        }

        const iconSet = new ConfigHelper().getIconSet()

        const imagePath = path.resolve(__dirname, `../assets/icon-sets/${iconSet}/${imageID}`)

        if (!existsSync(imagePath)) {
            logWarn(`image ${imageID} not found in the assets`)

            return new AttachmentBuilder(
                path.resolve(__dirname, `../assets/icon-sets/${iconSet}/image_not_found.png`),
                {name: 'image_not_found.png'}
            )
        }

        return new AttachmentBuilder(imagePath, {name: imageID})
    }
}