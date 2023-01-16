import {Interaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {getEntry} from "../../../utils/CacheUtil";

export class ReactionInteraction {
    protected config = new ConfigHelper()
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected functionCache = getEntry('function')

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: Interaction) {
        console.log(interaction)
    }
}