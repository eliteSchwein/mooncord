import {ButtonInteraction, Message} from "discord.js";
import {findValue} from "../../../../utils/CacheUtil";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class ModalButton {
    protected modalHelper = new ModalHelper()
    protected templateHelper = new TemplateHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.show_modal === 'undefined') { return }

        const modal = await this.modalHelper.generateModal(buttonData.function_mapping.show_modal)

        const currentMessage = interaction.message as Message

        if(buttonData.function_mapping.modal_delete_message) {
            await currentMessage.delete()
        }

        await interaction.showModal(modal)
    }
}