'use strict'

import {Message, StringSelectMenuInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {MCUHelper} from "../../../../helper/MCUHelper";
import BaseSelection from "./BaseSelection";

export class ViewSystemInfo extends BaseSelection {
    selectionId = 'systeminfo_select'

    async handleSelection(interaction: StringSelectMenuInteraction) {
        await interaction.deferReply()
        const currentMessage = interaction.message as Message

        const mcuHelper = new MCUHelper()

        const component = interaction.values[0]

        let embedData: any

        if (component.startsWith('mcu')) {
            const mcuData = mcuHelper.getMCULoad(component)
            embedData = await this.embedHelper.generateEmbed(`systeminfo_mcu`, mcuData)
        } else {
            embedData = await this.embedHelper.generateEmbed(`systeminfo_${component}`)
        }

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}