import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";
import {StringSelectMenuInteraction} from "discord.js";
import {TemplateHelper} from "../../../../helper/TemplateHelper";

export default class BaseSelection {
    selectionId: string
    ephemeral = false
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

    public async executeSelection(interaction: StringSelectMenuInteraction, selectionId: string) {
        if (selectionId !== this.selectionId) {
            return
        }

        await interaction.deferReply({ephemeral: this.ephemeral})
        await this.handleSelection(interaction)
    }

    // you select something and this will get triggert, what else?
    async handleSelection(interaction: StringSelectMenuInteraction) {

    }
}