import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/ObjectMergeHelper";

import sectionMapping from '../meta/input_mapping.json'
import buttonAssign from '../meta/button_assign.json'
import {setData, getEntry} from "../utils/CacheUtil";
import {MessageActionRow, MessageButton, MessageSelectMenu} from "discord.js";
import {LocaleHelper} from "../helper/LocaleHelper";

export class DiscordInputGenerator {
    protected config = new ConfigHelper()
    protected localeHelper = new LocaleHelper()

    public generateInputCache() {
        this.generateCacheForSection('buttons');
        this.generateCacheForSection('selections');
    }

    protected generateCacheForSection(section: string) {
        const sectionCache = {}

        let sectionConfig = this.localeHelper.getLocale()[section]

        if(this.config.isButtonSyntaxLocale()) {
            sectionConfig = this.localeHelper.getSyntaxLocale()[section]
        }

        for (const selectionID in sectionConfig) {
            sectionCache[selectionID] = {}

            let text = {label: sectionConfig[selectionID]}
            let mapping = sectionMapping[section][selectionID]

            if(text.label.label !== 'undefined') {
                text = sectionConfig[selectionID]
            }

            if(typeof(mapping) === 'undefined') {
                mapping = {}
            }
            mergeDeep(sectionCache[selectionID], text, mapping)
        }


        setData(section, sectionCache)
    }

    public generateButtons(section: string) {
        const assignButtons = buttonAssign[section]
        const row = new MessageActionRow()

        if(typeof(assignButtons) === 'undefined') { return }

        for(const index in assignButtons) {
            const buttonId = assignButtons[index]
            
            row.addComponents(this.generateButton(buttonId))
        }

        return row
    }

    public generateSelection(selectionId: string, entries) {
        const cache = getEntry('selections')
        const selectionMeta = cache[selectionId]

        const selection = new MessageSelectMenu()
            .setCustomId(selectionId)
            .setPlaceholder(selectionMeta.label)

        for(const entry of entries) {
            selection.addOptions([{
                label: entry,
                description: selectionMeta.description.replace(/(\${entry})/g, entry),
                value: entry
            }])
        }

        return selection
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