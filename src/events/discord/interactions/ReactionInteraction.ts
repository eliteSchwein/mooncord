import {Message, MessageReaction, PartialMessageReaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {findValue, getEntry} from "../../../utils/CacheUtil";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {WebsocketHandler} from "./handlers/WebsocketHandler";
import {ExcludeConfirmHandler} from "./handlers/ExcludeConfirmHandler";
import {TempModalHandler} from "./handlers/TempModalHandler";
import {PrintJobStartHandler} from "./handlers/PrintJobStartHandler";
import {MessageHandler} from "./handlers/MessageHandler";
import {EmbedHandler} from "./handlers/EmbedHandler";
import {DeleteHandler} from "./handlers/DeleteHandler";
import {ReconnectHandler} from "./handlers/ReconnectHandler";
import {RefreshHandler} from "./handlers/RefreshHandler";
import {PrintRequestHandler} from "./handlers/PrintRequestHandler";
import {PrintlistHandler} from "./handlers/PrintlistHandler";
import {PageHandler} from "./handlers/PageHandler";
import {MacroHandler} from "./handlers/MacroHandler";
import {DeleteMessageHandler} from "./handlers/DeleteMessageHandler";

export class ReactionInteraction {
    protected config = new ConfigHelper()
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected functionCache = getEntry('function')
    protected reactionMetaCache = findValue('config.reaction_meta')
    protected reactionCache = findValue('config.input_meta.reactions')

    public constructor(interaction: MessageReaction | PartialMessageReaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: MessageReaction | PartialMessageReaction) {
        const emoji = interaction.emoji.toString()
        const message = interaction.message as Message

        if (message.author.id !== interaction.client.user.id) { return }

        const reactionId = this.reactionMetaCache[emoji]

        if(reactionId === undefined) { return }

        const reactionData = this.reactionCache[buttonId]

        const user = interaction.users.cache.first()

        logNotice(`${user.tag} reacted: ${reactionId}`)

        if(!this.permissionHelper.hasPermission(user, interaction.message.guild, reactionId)) {
            logWarn(`${user.tag} doesnt have the permission for: ${reactionId}`)
            return;
        }

        await new WebsocketHandler().execute(message, user, reactionData)
        await new ExcludeConfirmHandler().execute(message, user, reactionData)
        await new TempModalHandler().execute(message, user, reactionData)
        await new PrintJobStartHandler().execute(message, user, reactionData)
        await new MessageHandler().execute(message, user, reactionData)
        await new EmbedHandler().execute(message, user, reactionData)
        await new DeleteHandler().execute(message, user, reactionData)
        await new ReconnectHandler().execute(message, user, reactionData)
        await new RefreshHandler().execute(message, user, reactionData)
        await new PrintRequestHandler().execute(message, user, reactionData)
        await new PrintlistHandler().execute(message, user, reactionData)
        await new PageHandler().execute(message, user, reactionData)
        await new MacroHandler().execute(message, user, reactionData)
        await new DeleteMessageHandler().execute(message, user, reactionData)
    }
}