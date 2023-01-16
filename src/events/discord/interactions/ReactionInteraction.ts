import {MessageReaction, PartialMessageReaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {findValue, getEntry} from "../../../utils/CacheUtil";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {DeleteReaction} from "./reactions/DeleteReaction";

export class ReactionInteraction {
    protected config = new ConfigHelper()
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected functionCache = getEntry('function')
    protected reactionMetaCache = findValue('config.reaction_meta')

    public constructor(interaction: MessageReaction | PartialMessageReaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: MessageReaction | PartialMessageReaction) {
        const emoji = interaction.emoji.toString()
        const message = interaction.message

        if (message.author.id !== interaction.client.user.id) { return }

        const reactionId = this.reactionMetaCache[emoji]

        if(reactionId === undefined) { return }

        const user = interaction.users.cache.first()

        logNotice(`${user.tag} reacted: ${reactionId}`)

        if(!this.permissionHelper.hasPermission(user, interaction.message.guild, reactionId)) {
            logWarn(`${user.tag} doesnt have the permission for: ${reactionId}`)
            return;
        }

        await new DeleteReaction().execute(interaction, reactionId)
    }
}