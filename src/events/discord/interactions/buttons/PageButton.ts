import {ButtonInteraction, Message} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import { PageHelper } from "../../../../helper/PageHelper";
import { logNotice } from "../../../../helper/LoggerHelper";

export class PageButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping === 'undefined') { return }
        if(!buttonData.function_mapping.page_up &&
            !buttonData.function_mapping.page_down) { return }

        void this.execute(interaction, buttonData)
    }

    protected async execute(interaction: ButtonInteraction, buttonData) {
        const functionMap = buttonData.function_mapping

        if(interaction.message.embeds.length === 0) { return }

        const embed = interaction.message.embeds[0]
        const embedData = this.embedHelper.getRawEmbedByTitle(embed.title)

        if(typeof embedData === 'undefined') { return }

        const filterFooter = embedData.embedData.footer.replace(/(\${pages})/g, '')
        
        const pages = embed.footer.text.replace(filterFooter, '').split('/')
        const currentPage = Number.parseInt(pages[0])
        const pageHelper = new PageHelper(getEntry('gcode_files'), embedData.embedID)

        const pageData = pageHelper.getPage(functionMap.page_up, currentPage)

        logNotice(`select Page ${pageData.pages} for ${embedData.embedID}`)

        const answer = await this.embedHelper.generateEmbed(embedData.embedID, pageData)

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})
        await currentMessage.removeAttachments()
        
        if(interaction.replied) {
            await currentMessage.edit(answer.embed)
        } else {
            interaction.update(answer.embed)
        }
    }
}