import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {ChatInputCommandInteraction, MessageFlagsBitField} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {getMoonrakerClient} from "../../../../Application";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export default class BaseCommand {
    commandId: string
    ephemeral = false
    defer = true
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected database = new DatabaseUtil()
    protected config = new ConfigHelper()
    protected embedHelper = new EmbedHelper()
    protected serviceHelper = new ServiceHelper()
    protected consoleHelper = new ConsoleHelper()
    protected modalHelper = new ModalHelper()
    protected metadataHelper = new MetadataHelper()
    protected moonrakerClient = getMoonrakerClient()
    protected templateHelper = new TemplateHelper()

    public async executeCommand(interaction: ChatInputCommandInteraction, commandId: string) {
        if (commandId !== this.commandId) {
            return
        }

        if (this.defer) {
            await interaction.deferReply()
        } else if (this.defer && this.ephemeral) {
            await interaction.deferReply({flags: MessageFlagsBitField.Flags.Ephemeral})
        }

        await this.handleCommand(interaction)
    }

    // here we handle the command. what did you expect?
    async handleCommand(interaction: ChatInputCommandInteraction) {

    }
}