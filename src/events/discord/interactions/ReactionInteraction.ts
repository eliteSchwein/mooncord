'use strict'

import {Message, MessageReaction, PartialMessageReaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
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
import {ClearAttachmentsHandler} from "./handlers/ClearAttachmentsHandler";
import {WaitMessageHandler} from "./handlers/WaitMessageHandler";
import {ConfigHelper} from "../../../helper/ConfigHelper";

export class ReactionInteraction {
    protected config = new ConfigHelper()

    public constructor(interaction: MessageReaction | PartialMessageReaction) {
        void this.executeHandler(interaction)
    }

    private async executeHandler(interaction: MessageReaction | PartialMessageReaction) {
        const emoji = interaction.emoji.toString()
        const message = interaction.message as Message

        if (message.author === null) {
            return
        }

        if (message.author.id !== interaction.client.user.id) {
            return
        }

        const permissionHelper = new PermissionHelper()
        const reactionConfigs = this.config.getEntriesByFilter(/^reaction /g, true)

        let reactionData = undefined
        let reactionId = ''

        for (const configReactionId in reactionConfigs) {
            const reactionConfig = reactionConfigs[configReactionId]
            if(!reactionConfig.emoji.includes(emoji)) continue

            reactionId = configReactionId
            reactionData = reactionConfig
        }

        if(!reactionData) return

        const user = interaction.users.cache.first()

        logNotice(`${user.tag} reacted: ${reactionId}`)

        if (!permissionHelper.hasPermission(user, interaction.message.guild, reactionId)) {
            logWarn(`${user.tag} doesnt have the permission for: ${reactionId}`)
            return;
        }

        await new WaitMessageHandler().executeHandler(message, user, reactionData)
        await new ClearAttachmentsHandler().executeHandler(message, user, reactionData)
        await new MacroHandler().executeHandler(message, user, reactionData)
        await new DeleteHandler().executeHandler(message, user, reactionData)
        await new CameraSettingHandler().executeHandler(message, user, reactionData)
        await new WebsocketHandler().executeHandler(message, user, reactionData)
        await new ExcludeConfirmHandler().executeHandler(message, user, reactionData)
        await new ModalHandler().executeHandler(message, user, reactionData)
        await new PrintJobStartHandler().executeHandler(message, user, reactionData)
        await new EmbedHandler().executeHandler(message, user, reactionData)
        await new MessageHandler().executeHandler(message, user, reactionData)
        await new ReconnectHandler().executeHandler(message, user, reactionData)
        await new RefreshHandler().executeHandler(message, user, reactionData)
        await new ListHandler().executeHandler(message, user, reactionData)
        await new DownloadHandler().executeHandler(message, user, reactionData)
        await new PageHandler().executeHandler(message, user, reactionData)
        await new DeleteMessageHandler().executeHandler(message, user, reactionData)
        await new SetupHandler().executeHandler(message, user, reactionData)
        await new NotificationHandler().executeHandler(message, user, reactionData)
    }
}