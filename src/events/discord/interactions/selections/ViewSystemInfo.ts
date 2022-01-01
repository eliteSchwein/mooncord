import {ButtonInteraction, Message, MessageEmbed, SelectMenuInteraction} from "discord.js";
import {findValue, getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {formatTime} from "../../../../helper/DataHelper";
import * as bytes from "bytes"

export class ViewSystemInfo {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected metadataHelper = new MetadataHelper()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if(selectionId !== 'systeminfo_select') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply()
        const currentMessage = interaction.message as Message

        const component = interaction.values[0]

        const totalMemoryRaw = bytes.parse(
            findValue('machine_info.system_info.cpu_info.total_memory') +
            findValue('machine_info.system_info.cpu_info.memory_units'))

        const freeMemoryRaw = findValue('state.system_stats.memavail')

        const totalSDRaw = findValue('machine_info.system_info.sd_info.total_bytes')

        const totalMemory = (totalMemoryRaw / (1024 ** 3))
            .toFixed(2)

        const freeMemory = (freeMemoryRaw / (1024 ** 2))
            .toFixed(2)

        const totalSD = (totalSDRaw / (1024 ** 2))
            .toFixed(2)

        let embedData = await this.embedHelper.generateEmbed('systeminfo_cpu')

        if(component.startsWith('mcu')) {

        } else {
            embedData = await this.embedHelper.generateEmbed(`systeminfo_${component}`, {
                "total_ram": totalMemory,
                "free_ram": freeMemory,
                "total_sd": totalSD})
        }

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(embedData.embed)

        await interaction.deleteReply()
    }
}