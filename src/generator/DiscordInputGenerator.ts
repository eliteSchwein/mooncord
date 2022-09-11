import {ConfigHelper} from "../helper/ConfigHelper";
import {limitString, mergeDeep, parsePageData} from "../helper/DataHelper";

import {getExcludeChoices, getHeaterChoices, setData} from "../utils/CacheUtil";
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

    protected generateCacheForSection(section: string) {
        let sectionConfig = this.localeHelper.getLocale()[section]

        if(this.config.isButtonSyntaxLocale()) {
            sectionConfig = this.localeHelper.getSyntaxLocale()[section]
        }

        mergeDeep(sectionConfig, this.inputMeta[section])

        setData(section, sectionConfig)
    }

    public generateButtons(buttons) {
        const row = new MessageActionRow()

        if(typeof(buttons) === 'undefined') { return }
        if(buttons.length === 0) { return }

        for (const buttonData of buttons) {
            row.addComponents(
                new MessageButton()
                    .setCustomId(buttonData.id)
                    .setEmoji(buttonData.emoji)
                    .setLabel(buttonData.label)
                    .setStyle(buttonData.style)
            )
        }

        if(row.components.length === 0) {
            return
        }

        return row
    }

    public generateSelections(selections) {
        const row = new MessageActionRow()

        if(typeof selections === 'undefined') { return }
        if(selections.length === 0) { return }

        for (const selectionData of selections) {
            const selection = new MessageSelectMenu()
            selection.setCustomId(selectionData.id)
                .setPlaceholder(String(selectionData.label))
                .setMinValues(selectionData.min_value)
                .setMaxValues(selectionData.max_value)

            if(typeof selectionData.options !== 'undefined') {
                selectionData.data = selectionData.options
            }

            if(selectionData.heater_options) {
                selectionData.data = [...selectionData.data, ...getHeaterChoices()]
            }

            if(selectionData.exclude_options) {
                selectionData.data = [...selectionData.data, ...getExcludeChoices()]
            }

            if(selectionData.mcu_options) {
                selectionData.data = [...selectionData.data, ...this.mcuHelper.getMCUOptions()]
            }

            for(const data of selectionData.data) {
                const selectionMetaRaw = JSON.stringify(selectionData)

                const selectionMetaParsed = JSON.parse(parsePageData(selectionMetaRaw, data))

                selection.addOptions([{
                    label: limitString(selectionMetaParsed.option_label, 100),
                    description: limitString(selectionMetaParsed.option_description, 100),
                    value: limitString(selectionMetaParsed.option_value, 100)
                }])
            }

            row.addComponents(selection)
        }

        return row
    }

    public generateInputs(inputs) {
        const componentRows = []

        if(typeof(inputs) === 'undefined') { return }
        if(inputs.length === 0) { return }

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
}