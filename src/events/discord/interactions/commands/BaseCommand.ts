import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";
import {ConfigHelper} from "../../../../helper/ConfigHelper";

export default class BaseCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected database = new DatabaseUtil()
    protected config = new ConfigHelper()

    commandId = ''

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== this.commandId) {
            return
        }

        void this.handleCommand(interaction)
    }

    async handleCommand(interaction: CommandInteraction) {
        // here the command stuff, extend this class
    }
}