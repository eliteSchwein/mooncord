import type {Message, SelectMenuInteraction} from "discord.js";
import {MessageEmbed} from "discord.js";

import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {GraphHelper} from "../../../../helper/GraphHelper";
import {TempHelper} from "../../../../helper/TempHelper";

export class ExcludeObjectsSelection {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected graphHelper = new GraphHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()
    protected functionCache = getEntry('function')
    protected tempHelper = new TempHelper()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'exclude_objects') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const object = interaction.values[0]

        const embedData = await this.embedHelper.generateEmbed('exclude_detail', {object})
        const excludeGraph = await this.graphHelper.getExcludeGraph(object)
        const embed = embedData.embed.embeds[0] as MessageEmbed
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