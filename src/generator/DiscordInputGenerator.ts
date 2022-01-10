import {ConfigHelper} from "../helper/ConfigHelper";
import {limitString, mergeDeep, parsePageData} from "../helper/DataHelper";

import {setData, getEntry} from "../utils/CacheUtil";
import {MessageActionRow, MessageButton, MessageSelectMenu} from "discord.js";
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
    }

    protected generateCacheForSection(section: string) {
        let sectionConfig = this.localeHelper.getLocale()[section]

        if(this.config.isButtonSyntaxLocale()) {
            sectionConfig = this.localeHelper.getSyntaxLocale()[section]
        }

        mergeDeep(sectionConfig, this.inputMeta[section])

        setData(section, sectionConfig)
    }

    public generateButtons(buttonIDs: []) {
        const row = new MessageActionRow()

        if(typeof(buttonIDs) === 'undefined') { return }

        for(const index in buttonIDs) {
            const buttonId = buttonIDs[index]

            row.addComponents(this.generateButton(buttonId))
        }

        if(row.components.length === 0) {
            return
        }

        return row
    }

    public generateSelection(selectionData) {
        if(typeof selectionData === 'undefined') {
            return
        }

        const cache = getEntry('selections')
        const selectionMeta = cache[selectionData.id]
        const row = new MessageActionRow()

        const selection = new MessageSelectMenu()
            .setCustomId(selectionData.id)
            .setPlaceholder(selectionMeta.label)
            .setMinValues(selectionMeta.min_value)
            .setMaxValues(selectionMeta.max_value)

        if(typeof selectionMeta.options !== 'undefined') {
            selectionData.data = selectionMeta.options
        }

        if(selectionMeta.mcu_options) {
            selectionData.data = [...selectionData.data, ...this.mcuHelper.getMCUOptions()]
        }

        for(const data of selectionData.data) {
            const selectionMetaRaw = JSON.stringify(selectionMeta)

            const selectionMetaParsed = JSON.parse(parsePageData(selectionMetaRaw, data))

            selection.addOptions([{
                label: limitString(selectionMetaParsed.option_label, 100),
                description: limitString(selectionMetaParsed.option_description, 100),
                value: limitString(selectionMetaParsed.option_value, 100)
            }])
        }

        row.addComponents(selection)

        return row
    }

    public generateButton(buttonId: string) {
        const cache = getEntry("buttons")
        const buttonMeta = cache[buttonId]

        const button = new MessageButton()
            .setCustomId(buttonId)
            .setLabel(buttonMeta.label)
            .setStyle(buttonMeta.style)

        if(typeof(buttonMeta.emoji) !== 'undefined') {
            button.setEmoji(buttonMeta.emoji)
        }
        return button
    }
}