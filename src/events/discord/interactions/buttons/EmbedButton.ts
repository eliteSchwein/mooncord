import {ButtonInteraction, Message} from "discord.js";
import {findValue} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class EmbedButton {
    protected embedHelper = new EmbedHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.show_embed === 'undefined') { return }

        const currentMessage = interaction.message as Message

        const embed = await this.embedHelper.generateEmbed(buttonData.function_mapping.show_embed)

        if(interaction.replied) {
            await interaction.followUp(embed.embed)
        } else {
            if(buttonData.function_mapping.message_as_follow_up) {
                await interaction.reply(embed.embed)
                return
            }
            await currentMessage.edit({components: null, embeds: null})
            await currentMessage.removeAttachments()

            await interaction.update(embed.embed)
        }
    }
}