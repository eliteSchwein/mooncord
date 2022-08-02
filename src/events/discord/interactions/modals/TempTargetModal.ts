import {ModalSubmitInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {TempHelper} from "../../../../helper/TempHelper";

export class TempTargetModal {
    protected localeHelper = new LocaleHelper()
    protected tempHelper = new TempHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: ModalSubmitInteraction, modalId: string) {
        if(modalId !== 'temp_target') { return }

        this.execute(interaction)
    }
    private async execute(interaction: ModalSubmitInteraction) {
        const targetTemp = interaction.components[1].components[0].value
        const targetHeater = interaction.components[0].components[0].value

        console.log(JSON.stringify(interaction))

        return

        if(isNaN(Number(targetTemp))) {
            await interaction.reply(this.locale.messages.errors.input_not_a_number
                .replace(/(\${input})/g, this.locale.inputs.temp_target_input.label)
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        const targetResult = await this.tempHelper.setHeaterTemp(targetHeater, Number(targetTemp))

        if(targetResult === false) {
            return
        }

        if(typeof targetResult === 'string') {
            await interaction.reply(targetResult
                .replace(/(\${username})/g, interaction.user.tag))
            return
        }

        await interaction.reply(this.locale.messages.answers.preheat_preset.manual
            .replace(/(\${heater_list})/g, `${targetHeater}`)
            .replace(/(\${username})/g, interaction.user.tag))
    }
}