import {ConfigHelper} from "../helper/ConfigHelper";
import {limitString, mergeDeep, parsePageData} from "../helper/DataHelper";

import {findValue, getExcludeChoices, getHeaterChoices, setData} from "../utils/CacheUtil";
import {MessageActionRow, MessageButton, MessageSelectMenu, TextInputComponent} from "discord.js";
import {LocaleHelper} from "../helper/LocaleHelper";
import {MCUHelper} from "../helper/MCUHelper";

export class DiscordInputGenerator {
    protected config = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected inputMeta = this.config.getInputMeta()
    protected mcuHelper = new MCUHelper()

    public generateInputCache() {
        this.generateCacheForSection('buttons');
        this.generateCacheForSection('selections');
        this.generateCacheForSection('inputs');
    }

    public generateButtons(buttons) {
        const row = new MessageActionRow()

        if (typeof (buttons) === 'undefined') {
            return
        }
        if (buttons.length === 0) {
            return
        }

        for (const buttonData of buttons) {
            if (buttonData.required_cache !== undefined) {
                if (buttonData.required_cache.map(findValue).map(v => !v).find(v => v)) {
                    continue
                }
            }

            const button = new MessageButton()
                .setCustomId(buttonData.id)
                .setEmoji(buttonData.emoji)
                .setStyle(buttonData.style)

            if (buttonData.label !== null && buttonData.label !== undefined) {
                button.setLabel(buttonData.label)
            }

            row.addComponents(button)
        }

        if (row.components.length === 0) {
            return
        }

        return row
    }

    public generateSelections(selections) {
        const rows = []

        if (typeof selections === 'undefined') {
            return
        }
        if (selections.length === 0) {
            return
        }

        for (const selectionData of selections) {
            const row = new MessageActionRow()

            if (selectionData.required_cache !== undefined) {
                if (selectionData.required_cache.map(findValue).map(v => !v).find(v => v)) {
                    continue
                }
            }

            const selection = new MessageSelectMenu()
            selection.setCustomId(selectionData.id)
                .setPlaceholder(String(selectionData.label))
                .setMinValues(selectionData.min_value)
                .setMaxValues(selectionData.max_value)

            if (typeof selectionData.options !== 'undefined') {
                selectionData.data = selectionData.options
            }

            if (selectionData.heater_options) {
                selectionData.data = [...selectionData.data, ...getHeaterChoices()]
            }

            if (selectionData.exclude_options) {
                selectionData.data = [...selectionData.data, ...getExcludeChoices()]
            }

            if (selectionData.mcu_options) {
                selectionData.data = [...selectionData.data, ...this.mcuHelper.getMCUOptions()]
            }

            for (const data of selectionData.data) {
                const selectionMetaRaw = JSON.stringify(selectionData)

                const selectionMetaParsed = JSON.parse(parsePageData(selectionMetaRaw, data))

                selection.addOptions([{
                    label: limitString(selectionMetaParsed.option_label, 100),
                    description: limitString(selectionMetaParsed.option_description, 100),
                    value: limitString(selectionMetaParsed.option_value, 100)
                }])
            }

            row.addComponents(selection)

            rows.push(row)
        }

        return rows
    }

    public generateInputs(inputs) {
        const componentRows = []

        if (typeof (inputs) === 'undefined') {
            return
        }
        if (inputs.length === 0) {
            return
        }

        for (const inputData of inputs) {
            const row = new MessageActionRow()

            row.addComponents(
                new TextInputComponent()
                    .setCustomId(inputData.id)
                    .setLabel(inputData.label)
                    .setStyle(inputData.style)
                    .setValue(String(inputData.value))
                    .setRequired(inputData.required)
            )

            componentRows.push(row)
        }

        return componentRows
    }

    protected generateCacheForSection(section: string) {
        let sectionConfig = this.localeHelper.getLocale()[section]

        if (this.config.isButtonSyntaxLocale()) {
            sectionConfig = this.localeHelper.getSyntaxLocale()[section]
        }

        const meta = this.inputMeta[section]

        if(section === 'buttons' && meta.functions === undefined) {
            meta.functions = []
        }

        mergeDeep(sectionConfig, meta)

        setData(section, sectionConfig)
    }
}