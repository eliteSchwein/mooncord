import {ButtonInteraction, Message} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class RefreshButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(!buttonData.function_mapping.refresh_status) { return }

        const functionCache = getEntry('function')

        const waitMessage = this.locale.messages.answers.status_update
            .replace(/(\${username})/g, interaction.user.tag)

        if(interaction.replied) {
            await interaction.followUp({ephemeral: true, content: waitMessage})
        } else {
            await interaction.update({components: null, content: waitMessage})
        }

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.configHelper.getStatusMeta()[currentStatus]

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null})

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await currentMessage.removeAttachments()
        await currentMessage.edit(message.embed)
    }
}