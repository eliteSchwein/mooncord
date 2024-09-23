'use strict'

import {ModalSubmitInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {TempHelper} from "../../../../helper/TempHelper";
import BaseModal from "../abstracts/BaseModal";

export class TempTargetModal extends BaseModal {
    modalId = 'temp_target'

    async handleModal(interaction: ModalSubmitInteraction) {
        const componentRows = interaction.components

        const tempHelper = new TempHelper()

        let heaterList = ''

        for (const componentRow of componentRows) {
            const heaterInput = componentRow.components[0]
            const heater = heaterInput.customId
            const heaterTarget = heaterInput.value

            if (isNaN(Number(heaterTarget))) {
                await interaction.reply(this.locale.messages.errors.input_not_a_number
                    .replace(/(\${input})/g, this.locale.inputs.temp_target_input.label
                        .replace(/(\${heater})/g, heater))
                    .replace(/(\${username})/g, interaction.user.tag))
                continue
            }

            const targetResult = await tempHelper.setHeaterTemp(tempHelper.getHeaterConfigName(heater), Number(heaterTarget))

            if (targetResult === false) {
                continue
            }

            heaterList = `\`${heater}: ${heaterTarget}C°\`, ${heaterList}`
        }

        heaterList = heaterList.slice(0, Math.max(0, heaterList.length - 2))

        const finalReply = this.locale.messages.answers.preheat_preset.manual
            .replace(/(\${heater_list})/g, `${heaterList}`)
            .replace(/(\${username})/g, interaction.user.tag)

        if (!interaction.replied) {
            await interaction.reply(finalReply)
        } else {
            await interaction.followUp(finalReply)
        }
    }
}