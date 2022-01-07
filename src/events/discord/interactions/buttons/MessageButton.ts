import {ButtonInteraction, Message} from "discord.js";
import {findValue} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";

export class MessageButton {
    protected embedHelper = new EmbedHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.message === 'undefined') { return }

        const currentMessage = interaction.message as Message
        const embed = currentMessage.embeds[0]

        let label = buttonData.label

        if(typeof buttonData.emoji !== 'undefined') {
            label = `${buttonData.emoji} ${label}`
        }

        let message = buttonData.function_mapping.message
            
        if(/(\${).*?}/g.test(message)) {
            const placeholderId = message
                .replace(/(\${)/g,'')
                .replace(/}/g,'')
            
            message = findValue(placeholderId)
        }

        message = message
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)
            .replace(/(\${embed_author})/g, this.embedHelper.getAuthorName(embed))
            .replace(/(\${embed_title})/g, this.embedHelper.getTitle(embed))

        if(interaction.replied) {
            await interaction.followUp(message)
        } else {
            if(buttonData.function_mapping.message_as_follow_up) {
                await interaction.reply(message)
                return
            }
            await currentMessage.edit({components: null, embeds: null})
            await currentMessage.removeAttachments()

            await interaction.update({content: message, components: [], embeds: []})
        }
    }
}