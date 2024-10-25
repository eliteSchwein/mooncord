'use strict'

import {ModalSubmitInteraction} from "discord.js";
import BaseModal from "../abstracts/BaseModal";

export class ExecuteModal extends BaseModal {
    modalId = 'execute_modal'

    async handleModal(interaction: ModalSubmitInteraction) {
        const componentRows = interaction.components
        const input = componentRows[0].components[0]
        const gcodes = input.value.split('\n')

        const gcodeValid = await this.consoleHelper.executeGcodeCommands(gcodes, interaction.channel)

        let answer = this.locale.messages.answers.execute_successful
            .replace(/\${username}/g, interaction.user.tag)

        if (gcodeValid === 0) {
            answer = this.locale.messages.errors.execute_failed
                .replace(/\${username}/g, interaction.user.tag)
        }

        if (gcodeValid === -1) {
            answer = this.locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        await interaction.editReply(answer)
    }
}