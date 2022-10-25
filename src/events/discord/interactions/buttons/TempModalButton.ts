import {ButtonInteraction, Message} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class TempModalButton {
    protected modalHelper = new ModalHelper()
    protected embedHelper = new EmbedHelper()
    protected templateHelper = new TemplateHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.show_temp_modal === 'undefined') { return }

        const currentMessage = interaction.message as Message

        const modal = await this.modalHelper.generateModal('temp_target')

        if(buttonData.function_mapping.modal_delete_message) {
            await currentMessage.delete()
        }

        await interaction.showModal(modal)
    }
}