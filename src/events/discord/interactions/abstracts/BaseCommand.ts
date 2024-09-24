import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {ChatInputCommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {getMoonrakerClient} from "../../../../Application";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";

export default class BaseCommand {
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

    commandId: string
    ephemeral = false
    defer = true

    public async executeCommand(interaction: ChatInputCommandInteraction, commandId: string) {
        if (commandId !== this.commandId) {
            return
        }

        if(this.defer) {
            await interaction.deferReply({ephemeral: this.ephemeral})
        }
        await this.handleCommand(interaction)
    }

    async handleCommand(interaction: ChatInputCommandInteraction) {
        // here the command stuff, extend this class
    }
}