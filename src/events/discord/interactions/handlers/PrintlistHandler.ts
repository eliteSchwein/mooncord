import {ButtonInteraction, Message, User} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";

export class PrintlistHandler {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(message: Message, user: User, data, interaction = null) {
        if(!data.function_mapping.show_printlist) { return }


        if(interaction !== null && !interaction.replied && !interaction.deferred) { await interaction.deferReply() }

        const pageHelper = new PageHelper('gcode_files')
        const pageData = pageHelper.getPage(false, 1)

        const answer = await this.embedHelper.generateEmbed('gcode_files', pageData)

        await message.edit({components: null})
        await message.removeAttachments()

        await message.edit(answer.embed)

        if(interaction !== null && !interaction.replied) {
            await interaction.deleteReply()
        }
    }
}