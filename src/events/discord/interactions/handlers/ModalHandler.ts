'use strict'

import {Message, User} from "discord.js";
import BaseHandler from "../abstracts/BaseHandler";

export class ModalHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return typeof data.modal !== 'undefined';
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        if (interaction === null) {
            return
        }

        const modal = await this.modalHelper.generateModal(data.modal)

        await interaction.showModal(modal)
    }
}