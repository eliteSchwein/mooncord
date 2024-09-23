import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {ModalHelper} from "../../../../helper/ModalHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";
import {getMoonrakerClient} from "../../../../Application";
import {Message, User} from "discord.js";

export default class BaseHandler {
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

    public async execute(message: Message, user: User, data, interaction = null) {
        if(!(await this.isValid(message, user, data, interaction))) {
            return
        }

        await this.handleHandler(message, user, data, interaction)
    }

    async isValid(message: Message, user: User, data, interaction = null) {
        return false
    }

    // yes we handle the Handler. big suprise what?
    async handleHandler(message: Message, user: User, data, interaction = null) {

    }
}