import {CommandInteraction, MessageEmbed} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {getEntry} from "../../../../utils/CacheUtil";
import {logNotice} from "../../../../helper/LoggerHelper";
import {getMoonrakerClient} from "../../../../Application";

export class PrintjobCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()
    protected embedHelper = new EmbedHelper()
    protected buttonsCache = getEntry('buttons')
    protected moonrakerClient = getMoonrakerClient()
    protected functionCache = getEntry('function')

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'printjob') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const subCommand = interaction.options.getSubcommand()

        if(subCommand === this.syntaxLocale.commands.printjob.options.pause.name) {
            await this.triggerMacro('printjob_pause', interaction, this.locale.messages.answers.printjob_pause, 'pause')
            return
        }

        if(subCommand === this.syntaxLocale.commands.printjob.options.cancel.name) {
            await this.triggerMacro('printjob_cancel', interaction, this.locale.messages.answers.printjob_cancel)
            return
        }

        if(subCommand === this.syntaxLocale.commands.printjob.options.resume.name) {
            await this.triggerMacro('printjob_resume', interaction, this.locale.messages.answers.printjob_resume, 'printing')
            return
        }
    }

    protected async triggerMacro(buttonId: string, interaction: CommandInteraction, subLocale, status = '') {
        const buttonData = this.buttonsCache[buttonId]

        if(typeof buttonData.function_mapping.macros === 'undefined') { return }
        if(buttonData.function_mapping.macros.empty) { return }
        if(typeof buttonData.function_mapping.required_states === 'undefined') { return }

        const requiredStates = buttonData.function_mapping.required_states

        if(status === this.functionCache.current_status) {
            const message = subLocale.status_same
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        if(!requiredStates.includes(this.functionCache.current_status)) {
            const message = subLocale.status_not_valid
                .replace(/(\${username})/g, interaction.user.tag)

            await interaction.reply(message)
            return
        }

        for(const macro of buttonData.function_mapping.macros) {
            logNotice(`executing macro: ${macro}`)
            void this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${macro}"}}`, Number.POSITIVE_INFINITY)
        }

        const message = subLocale.status_valid
            .replace(/(\${username})/g, interaction.user.tag)

        await interaction.reply(message)
    }
}