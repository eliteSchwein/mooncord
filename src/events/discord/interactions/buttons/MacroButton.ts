import {ButtonInteraction, Message} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import {getDatabase, getMoonrakerClient} from "../../../../Application";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {logNotice} from "../../../../helper/LoggerHelper";

export class MacroButton {
    protected databaseUtil = getDatabase()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: ButtonInteraction, buttonData) {
        if(typeof buttonData.function_mapping.macros === 'undefined') { return }
        if(buttonData.function_mapping.macros.empty) { return }

        void this.execute(interaction, buttonData)
    }

    protected async execute(interaction: ButtonInteraction, buttonData) {
        for(const macro of buttonData.function_mapping.macros) {
            logNotice(`executing macro: ${macro}`)
            void this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${macro}"}}`, Number.POSITIVE_INFINITY)
        }

        let label = buttonData.label

        if(typeof buttonData.emoji !== 'undefined') {
            label = `${buttonData.emoji} ${label}`
        }

        const message = this.locale.messages.answers.macros_executed
            .replace(/(\${username})/g, interaction.user.tag)
            .replace(/(\${button_label})/g, label)

        if(interaction.replied) {
            await interaction.followUp({ephemeral: false, content: message})
        } else {
            await interaction.reply({ephemeral: false, content: message})
        }
    }
}