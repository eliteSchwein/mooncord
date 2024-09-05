'use strict'

import {Message, MessageReaction, PartialMessageReaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {findValue, getEntry} from "../../../utils/CacheUtil";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {WebsocketHandler} from "./handlers/WebsocketHandler";
import {ExcludeConfirmHandler} from "./handlers/ExcludeConfirmHandler";
import {ModalHandler} from "./handlers/ModalHandler";
import {PrintJobStartHandler} from "./handlers/PrintJobStartHandler";
import {MessageHandler} from "./handlers/MessageHandler";
import {EmbedHandler} from "./handlers/EmbedHandler";
import {DeleteHandler} from "./handlers/DeleteHandler";
import {ReconnectHandler} from "./handlers/ReconnectHandler";
import {RefreshHandler} from "./handlers/RefreshHandler";
import {ListHandler} from "./handlers/ListHandler";
import {PageHandler} from "./handlers/PageHandler";
import {MacroHandler} from "./handlers/MacroHandler";
import {DeleteMessageHandler} from "./handlers/DeleteMessageHandler";
import {CameraSettingHandler} from "./handlers/CameraSettingHandler";
import DownloadHandler from "./handlers/DownloadHandler";
import {SetupHandler} from "./handlers/SetupHandler";
import {NotificationHandler} from "./handlers/NotificationHandler";

export class ReactionInteraction {

    public constructor(interaction: MessageReaction | PartialMessageReaction) {
        void this.execute(interaction)
    }

    private async execute(interaction: MessageReaction | PartialMessageReaction) {
        const emoji = interaction.emoji.toString()
        const message = interaction.message as Message

        if(message.author === null) {
            return
        }

        if (message.author.id !== interaction.client.user.id) {
            return
        }

        const permissionHelper = new PermissionHelper()
        const reactionMetaCache = findValue('config.reaction_meta')
        const reactionCache = findValue('config.input_meta.reactions')

        const reactionId = reactionMetaCache[emoji]

        if (reactionId === undefined) {
            return
        }

        const reactionData = reactionCache[reactionId]

        const user = interaction.users.cache.first()

        logNotice(`${user.tag} reacted: ${reactionId}`)

        if (!permissionHelper.hasPermission(user, interaction.message.guild, reactionId)) {
            logWarn(`${user.tag} doesnt have the permission for: ${reactionId}`)
            return;
        }

        await new MacroHandler().execute(message, user, reactionData)
        await new CameraSettingHandler().execute(message, user, reactionData)
        await new WebsocketHandler().execute(message, user, reactionData)
        await new ExcludeConfirmHandler().execute(message, user, reactionData)
        await new ModalHandler().execute(message, user, reactionData)
        await new PrintJobStartHandler().execute(message, user, reactionData)
        await new MessageHandler().execute(message, user, reactionData)
        await new EmbedHandler().execute(message, user, reactionData)
        await new DeleteHandler().execute(message, user, reactionData)
        await new ReconnectHandler().execute(message, user, reactionData)
        await new RefreshHandler().execute(message, user, reactionData)
        await new ListHandler().execute(message, user, reactionData)
        await new DownloadHandler().execute(message, user, reactionData)
        await new PageHandler().execute(message, user, reactionData)
        await new DeleteMessageHandler().execute(message, user, reactionData)
        await new SetupHandler().execute(message, user, reactionData)
        await new NotificationHandler().execute(message, user, reactionData)
    }
}