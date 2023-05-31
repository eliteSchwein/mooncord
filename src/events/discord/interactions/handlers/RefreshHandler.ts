import {Message, User} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class RefreshHandler {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes('refresh_status')) {
            return
        }

        const functionCache = getEntry('function')

        const waitMessage = this.locale.messages.answers.status_update
            .replace(/(\${username})/g, interaction.user.tag)

        if (interaction !== null) {
            if (interaction.replied) {
                await interaction.followUp({ephemeral: true, content: waitMessage})
            } else {
                await interaction.update({components: null, content: waitMessage})
            }
        }

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.configHelper.getStatusMeta()[currentStatus]

        await message.edit({components: null})

        const newMessage = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await message.removeAttachments()
        await message.edit(newMessage.embed)
    }
}