import {ButtonInteraction, Message} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";

export class RefreshButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()

    public constructor(interaction: ButtonInteraction, buttonId: string) {
        if(buttonId !== 'printjob_refresh') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: ButtonInteraction) {
        const functionCache = getEntry('function')

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.configHelper.getStatusMeta()[currentStatus]

        const currentMessage = interaction.message as Message

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await currentMessage.removeAttachments()

        await interaction.update(message.embed)
    }
}