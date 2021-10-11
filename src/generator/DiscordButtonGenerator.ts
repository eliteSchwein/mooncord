import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/ObjectMergeHelper";

import buttonMapping from '../meta/button_mapping.json'
import buttonAssign from '../meta/button_assign.json'
import {getLocaleHelper} from "../Application";
import {setData, getEntry} from "../utils/CacheUtil";
import { MessageActionRow, MessageButton } from "discord.js";

export class DiscordButtonGenerator {
    protected config = new ConfigHelper()
    protected localeHelper = getLocaleHelper()

    public generateButtonCache() {
        const buttonCache = {}

        let buttonConfig = this.localeHelper.getLocale()['buttons']
        
        if(this.config.isButtonSyntaxLocale()) {
            buttonConfig = this.localeHelper.getSyntaxLocale()['buttons']
        }

        for (const buttonID in buttonConfig) {
            buttonCache[buttonID] = {}

            const text = {label: buttonConfig[buttonID]}

            let mapping = buttonMapping[buttonID]

            if(typeof(mapping) === 'undefined') {
                mapping = {}
            }
            mergeDeep(buttonCache[buttonID], text, mapping)
        }

        setData('buttons', buttonCache)
    }

    public generateButtons(section: string) {
        const assignButtons = buttonAssign[section]
        const cache = getEntry("buttons")
        const row = new MessageActionRow()

        if(typeof(assignButtons) === 'undefined') { return }

        for(const index in assignButtons) {
            const buttonId = assignButtons[index]
            const buttonMeta = cache[buttonId]
            
            const button = new MessageButton()
                .setCustomId(buttonId)
                .setLabel(buttonMeta.label)
                .setStyle(buttonMeta.style)

            if(typeof(buttonMeta.emoji) !== 'undefined') { 
                button.setEmoji(buttonMeta.emoji)
            }
            
            row.addComponents(button)
        }

        return row
    }
}