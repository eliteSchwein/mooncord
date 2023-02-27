import {CommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {HistoryHelper} from "../../../../helper/HistoryHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {getEntry} from "../../../../utils/CacheUtil";

export class HistoryCommand {
    protected embedHelper = new EmbedHelper()
    protected historyHelper = new HistoryHelper()
    protected localeHelper = new LocaleHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'history') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const serverComponents = getEntry('server_info').components

        if (!serverComponents.includes('history')) {
            await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.username))
            return
        }

        await interaction.deferReply()
        const printStats = this.historyHelper.getPrintStats()

        if (printStats.count === 0) {
            await interaction.editReply(this.localeHelper.getCommandNotReadyError(interaction.user.username))
            return
        }

        const message = await this.embedHelper.generateEmbed('history')

        void interaction.editReply(message.embed)
    }

}