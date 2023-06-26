'use strict'

import {ModalSubmitInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {TempHelper} from "../../../../helper/TempHelper";

export class TempTargetModal {

    public constructor(interaction: ModalSubmitInteraction, modalId: string) {
        if (modalId !== 'temp_target') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: ModalSubmitInteraction) {
        const componentRows = interaction.components
        const localeHelper = new LocaleHelper()
        const tempHelper = new TempHelper()
        const locale = localeHelper.getLocale()
        const syntaxLocale = localeHelper.getSyntaxLocale()

        let heaterList = ''

        for (const componentRow of componentRows) {
            const heaterInput = componentRow.components[0]
            const heater = heaterInput.customId
            const heaterTarget = heaterInput.value

            if (isNaN(Number(heaterTarget))) {
                await interaction.reply(locale.messages.errors.input_not_a_number
                    .replace(/(\${input})/g, locale.inputs.temp_target_input.label
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

        const finalReply = locale.messages.answers.preheat_preset.manual
            .replace(/(\${heater_list})/g, `${heaterList}`)
            .replace(/(\${username})/g, interaction.user.tag)

        if (!interaction.replied) {
            await interaction.reply(finalReply)
        } else {
            await interaction.followUp(finalReply)
        }
    }
}