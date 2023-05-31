import {Message, User} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class ModalHandler {
    protected modalHelper = new ModalHelper()
    protected embedHelper = new EmbedHelper()
    protected templateHelper = new TemplateHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.modal === 'undefined') {
            return
        }
        if (interaction === null) {
            return
        }

        const modal = await this.modalHelper.generateModal(data.modal)

        await interaction.showModal(modal)
    }
}