import {Message, SelectMenuInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {MCUHelper} from "../../../../helper/MCUHelper";

export class ViewSystemInfo {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()
    protected mcuHelper = new MCUHelper()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if (selectionId !== 'systeminfo_select') {
            return
        }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const currentMessage = interaction.message as Message

        const component = interaction.values[0]

        let embedData = await this.embedHelper.generateEmbed('systeminfo_cpu')

        if (component.startsWith('mcu')) {
            const mcuData = this.mcuHelper.getMCULoad(component)
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