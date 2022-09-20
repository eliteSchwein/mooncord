import {ButtonInteraction} from "discord.js";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";

export class MacroButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected consoleHelper = new ConsoleHelper()

    public async execute(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.macros === 'undefined') { return }
        if(buttonData.function_mapping.macros.empty) { return }

        const gcodeValid = await this.consoleHelper.executeGcodeCommands(buttonData.function_mapping.macros, interaction.channel)

        if(!buttonData.function_mapping.macro_message) { return }

        let label = buttonData.label

        if(typeof buttonData.emoji !== 'undefined') {
            label = `${buttonData.emoji} ${label}`
        }

        let answer = this.locale.messages.answers.macros_executed
            .replace(/\${username}/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)

        if(gcodeValid === 0) {
            answer = this.locale.messages.errors.macros_failed
                .replace(/\${username}/g, interaction.user.tag)
                .replace(/(\${button_label})/g, label)
        }

        if(gcodeValid === -1) {
            answer = this.locale.messages.errors.execute_running
                .replace(/\${username}/g, interaction.user.tag)
        }

        if(interaction.replied) {
            await interaction.followUp({ephemeral: false, content: answer})
        } else {
            await interaction.reply(answer)
        }
    }
}