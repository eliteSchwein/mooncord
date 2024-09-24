'use strict'

import {ConfigHelper} from "../helper/ConfigHelper";
import {limitString, mergeDeep, parsePageData} from "../helper/DataHelper";

import {findValue, getExcludeChoices, getHeaterChoices, setData} from "../utils/CacheUtil";
import {LocaleHelper} from "../helper/LocaleHelper";
import {MCUHelper} from "../helper/MCUHelper";
import {WebcamHelper} from "../helper/WebcamHelper";
import {ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, TextInputBuilder} from "discord.js";

export class DiscordInputGenerator {
    public generateInputCache() {
        this.generateCacheForSection('buttons');
        this.generateCacheForSection('selections');
        this.generateCacheForSection('inputs');
    }

    public generateButtons(buttons, buttonsPerRow = 0) {
        const rows = []
        let limit = 4
        let currentButton = 0

        if(buttonsPerRow > 0) {
            limit = buttonsPerRow - 1
        }

        rows.push(new ActionRowBuilder())

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

            const button = new ButtonBuilder()
                .setCustomId(buttonData.id)
                .setEmoji(buttonData.emoji)
                .setStyle(buttonData.style)

            if (buttonData.label !== null && buttonData.label !== undefined) {
                button.setLabel(buttonData.label)
            }

            if(currentButton > limit) {
                if (rows[1] === undefined) {
                    rows.push(new ActionRowBuilder())
                }

                rows[1].addComponents(button)
            } else {
                rows[0].addComponents(button)
            }

            currentButton++
        }

        if (rows[0].components.length === 0) {
            return
        }

        return rows
    }

    public generateSelections(selections) {
        const rows = []

        if (typeof selections === 'undefined') {
            return
        }
        if (selections.length === 0) {
            return
        }

        const mcuHelper = new MCUHelper()

        for (const selectionData of selections) {
            const row = new ActionRowBuilder()

            if (selectionData.required_cache !== undefined) {
                if (selectionData.required_cache.map(findValue).map(v => !v).find(v => v)) {
                    continue
                }
            }

            const selection = new StringSelectMenuBuilder()
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
                selectionData.data = [...selectionData.data, ...mcuHelper.getMCUOptions()]
            }

            if (selectionData.webcam_options) {
                selectionData.data = [...selectionData.data, ...new WebcamHelper().getWebcamChoices()]
            }

            if(selectionData.min_entries !== undefined &&
                selectionData.min_entries > selectionData.data.length) {
                continue
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
            const row = new ActionRowBuilder()

            row.addComponents(
                new TextInputBuilder()
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

    private generateCacheForSection(section: string) {
        const config = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const inputMeta = config.getInputMeta()

        let sectionConfig = localeHelper.getLocale()[section]

        if (config.isButtonSyntaxLocale()) {
            sectionConfig = localeHelper.getSyntaxLocale()[section]
        }

        const meta = inputMeta[section]

        if(section === 'buttons') {
            for(const key in meta) {
                const value = meta[key]

                if(value.functions === undefined) {
                    value.functions = []
                }

                meta[key] = value
            }
        }

        mergeDeep(sectionConfig, meta)

        setData(section, sectionConfig)
    }
}