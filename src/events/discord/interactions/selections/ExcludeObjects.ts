'use strict'

import {Message, SelectMenuInteraction} from "discord.js";

import {ExcludeGraph} from "../../../../helper/graphs/ExcludeGraph";
import BaseSelection from "./BaseSelection";

export class ExcludeObjectsSelection extends BaseSelection {
    selectionId = 'exclude_objects'

    async handleSelection(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const object = interaction.values[0]

        const embedData = await this.embedHelper.generateEmbed('exclude_detail', {object})
        const excludeGraph = await new ExcludeGraph().renderGraph(object)
        const embed = embedData.embed.embeds[0]
        const components = embedData.embed['components']
        const selectMenu = components[0].components[0]

        for (const selectMenuOption of selectMenu.options) {
            if (selectMenuOption.value === object) {
                selectMenuOption.default = true
            }
        }

        let files = [excludeGraph]

        if (typeof embedData.embed['files'] !== 'undefined') {
            files = [...files, ...embedData.embed['files']]
        }

        embed.setImage(`attachment://${excludeGraph.name}`)

        const currentMessage = interaction.message as Message
        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit({embeds: [embed], files, components})

        await interaction.deleteReply()
    }
}