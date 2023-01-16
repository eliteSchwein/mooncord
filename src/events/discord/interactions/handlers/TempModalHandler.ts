import {ButtonInteraction, Message, User} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class TempModalHandler {
    protected modalHelper = new ModalHelper()
    protected embedHelper = new EmbedHelper()
    protected templateHelper = new TemplateHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if(typeof data.function_mapping.show_temp_modal === 'undefined') { return }
        if(interaction === null) { return }

        const modal = await this.modalHelper.generateModal('temp_target')

        await interaction.showModal(modal)
    }
}