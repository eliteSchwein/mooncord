'use strict'

import {Message, User} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export class ModalHandler {

    public async execute(message: Message, user: User, data, interaction = null) {
        if (typeof data.modal === 'undefined') {
            return
        }
        if (interaction === null) {
            return
        }

        const modalHelper = new ModalHelper()
        const modal = await modalHelper.generateModal(data.modal)

        await interaction.showModal(modal)
    }
}