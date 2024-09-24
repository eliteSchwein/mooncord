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

export default class BaseSelection {
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

    selectionId: string
    ephemeral = false

    public async executeSelection(interaction: StringSelectMenuInteraction, selectionId: string) {
        if (selectionId !== this.selectionId) {
            return
        }

        await interaction.deferReply({ephemeral: this.ephemeral})
        await this.handleSelection(interaction)
    }

    async handleSelection(interaction: StringSelectMenuInteraction) {

    }
}