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

export class ShowTempSelection {
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
        if(selectionId !== 'show_temp') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()

        const heater = interaction.values[0]
        const temps = this.tempHelper.parseFields().fields
        let tempField = {}

        for(const temp of temps) {
            if(temp.name.endsWith(heater)) {
                tempField = temp
            }
        }

        const embedData = await this.embedHelper.generateEmbed('single_temperature',{heater}, [tempField])
        const tempGraph = await this.graphHelper.getTempGraph(heater)
        const embed = embedData.embed.embeds[0] as MessageEmbed
        const components = embedData.embed['components']
        let files = []

        if(typeof embedData.embed['files'] !== 'undefined') {
            files = [...files, ...embedData.embed['files']]
        }

        embed.setImage(tempGraph)

        const currentMessage = interaction.message as Message
        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit({embeds: [embed], files, components})

        await interaction.deleteReply()
    }
}