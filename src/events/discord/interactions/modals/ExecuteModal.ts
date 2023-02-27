import {ModalSubmitInteraction} from "discord.js";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class ExecuteModal {
    protected consoleHelper = new ConsoleHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: ModalSubmitInteraction, modalId: string) {
        if (modalId !== 'execute_modal') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: ModalSubmitInteraction) {
        const componentRows = interaction.components
        const input = componentRows[0].components[0]
        const gcodes = input.value.split('\n')

        await interaction.deferReply()

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