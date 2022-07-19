import {ButtonInteraction, Message} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import {PageHelper} from "../../../../helper/PageHelper";

export class PrintlistButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.show_printlist) { return }

        if(!interaction.replied &&
            !interaction.deferred) {
            await interaction.deferReply()
        }

        const pageHelper = new PageHelper('gcode_files')
        const pageData = pageHelper.getPage(false, 1)

        const answer = await this.embedHelper.generateEmbed('gcode_files', pageData)

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()

        await currentMessage.edit(answer.embed)

        if(!interaction.replied) {
            await interaction.deleteReply()
        }
    }
}