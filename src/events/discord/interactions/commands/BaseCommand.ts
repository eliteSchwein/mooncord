import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {ChatInputCommandInteraction} from "discord.js";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ServiceHelper} from "../../../../helper/ServiceHelper";
import {ConsoleHelper} from "../../../../helper/ConsoleHelper";
import {getMoonrakerClient} from "../../../../Application";

export default class BaseCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected database = new DatabaseUtil()
    protected config = new ConfigHelper()
    protected embedHelper = new EmbedHelper()
    protected serviceHelper = new ServiceHelper()
    protected consoleHelper = new ConsoleHelper()
    protected moonrakerClient = getMoonrakerClient()

    commandId = ''

    public constructor(interaction: ChatInputCommandInteraction, commandId: string) {
        if (commandId !== this.commandId) {
            return
        }

        void this.handleCommand(interaction)
    }

    async handleCommand(interaction: ChatInputCommandInteraction) {
        // here the command stuff, extend this class
    }
}