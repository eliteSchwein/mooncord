import {CommandInteraction} from "discord.js";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {PageHelper} from "../../../../helper/PageHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {uploadAttachment} from "../../../../helper/DataHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";

export class ExecuteCommand {
    protected databaseUtil = getDatabase()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected embedHelper = new EmbedHelper()
    protected modalHelper = new ModalHelper()
    protected serviceHelper = new ServiceHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'execute') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const gcodeArgument = interaction.options.getString(this.syntaxLocale.commands.execute.options.gcode.name)

        if(gcodeArgument === null) {
            const modal = await this.modalHelper.generateModal('execute_modal')
            await interaction.showModal(modal)
            return
        }

        await interaction.deferReply()
    }
}