import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";
import {ModalSubmitInteraction} from "discord.js";

export default class BaseModal {
    modalId = ''
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

    public async executeModal(interaction: ModalSubmitInteraction, modalId: string) {
        if (modalId !== this.modalId) {
            return
        }

        await interaction.deferReply({ephemeral: this.ephemeral})
        await this.handleModal(interaction)
    }

    async handleModal(interaction: ModalSubmitInteraction) {

    }
}