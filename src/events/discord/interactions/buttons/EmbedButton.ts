import {ButtonInteraction, Message} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class EmbedButton {
    protected embedHelper = new EmbedHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.show_embed === 'undefined') { return }

        if(!interaction.replied) { await interaction.deferReply() }

        const currentMessage = interaction.message as Message

        await currentMessage.edit({components: null, embeds: null})
        await currentMessage.removeAttachments()

        const embed = await this.embedHelper.generateEmbed(buttonData.function_mapping.show_embed)

        await currentMessage.edit(embed.embed)

        if(!interaction.deferred) { return }

        await interaction.deleteReply()
    }
}