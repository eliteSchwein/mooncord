import {CommandInteraction, MessageAttachment} from "discord.js";
import statusMapping from "../../../../meta/status_mapping.json"
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class StatusCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'status') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply()

        const functionCache = getEntry('function')

        const currentStatus = functionCache.current_status
        const currentStatusMeta = statusMapping[currentStatus]

        const message = await this.embedHelper.generateEmbed(currentStatusMeta.embed_id)

        await interaction.editReply(message.embed)
    }
}