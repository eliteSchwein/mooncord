import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {getEntry} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";

export class StatusCommand {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'status') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        const functionCache = getEntry('function')

        const currentStatus = functionCache.current_status
        const currentStatusMeta = this.configHelper.getStatusMeta()[currentStatus]

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}