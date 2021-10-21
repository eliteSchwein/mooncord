import {CommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class InfoCommand {
    protected embedHelper = new EmbedHelper()
    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'info') { return }

        const message = this.embedHelper.generateEmbed('info')
        
        void interaction.reply(message)
    }
}