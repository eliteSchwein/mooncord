'use strict'

import {Interaction, Message} from "discord.js";
import {RefreshHandler} from "./handlers/RefreshHandler";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {sleep} from "../../../helper/DataHelper";
import {getEntry} from "../../../utils/CacheUtil";
import {MacroHandler} from "./handlers/MacroHandler";
import {PageHandler} from "./handlers/PageHandler";
import {ListHandler} from "./handlers/ListHandler";
import {PrintJobStartHandler} from "./handlers/PrintJobStartHandler";
import {MessageHandler} from "./handlers/MessageHandler";
import {ReconnectHandler} from "./handlers/ReconnectHandler";
import {ModalHandler} from "./handlers/ModalHandler";
import {ExcludeConfirmHandler} from "./handlers/ExcludeConfirmHandler";
import {WebsocketHandler} from "./handlers/WebsocketHandler";
import {DeleteHandler} from "./handlers/DeleteHandler";
import {EmbedHandler} from "./handlers/EmbedHandler";
import {DeleteMessageHandler} from "./handlers/DeleteMessageHandler";
import {SetupHandler} from "./handlers/SetupHandler";
import {NotificationHandler} from "./handlers/NotificationHandler";
import {CameraSettingHandler} from "./handlers/CameraSettingHandler";
import {PromptHelper} from "../../../helper/PromptHelper";

export class ButtonInteraction {

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    private async execute(interaction: Interaction) {
        if (!interaction.isButton()) {
            return
        }

        const buttonId = interaction.customId

        if (buttonId === null) {
            return
        }

        const config = new ConfigHelper()
        const permissionHelper = new PermissionHelper()
        const localeHelper = new LocaleHelper()
        const locale = localeHelper.getLocale()
        const buttonsCache = getEntry('buttons')
        const functionCache = getEntry('function')

        if(buttonId.startsWith('prompt_gcode|')) {
            const gcode = buttonId.substring(13)
            await new PromptHelper().handePromptGcodeButton(gcode, interaction)
            return
        }

        const buttonData = buttonsCache[buttonId]
        const requiredStates = buttonData.required_states

        logNotice(`${interaction.user.tag} pressed button: ${buttonId}`)

        if (!permissionHelper.hasPermission(interaction.user, interaction.guild, buttonId)) {
            await interaction.reply({
                content: localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        if (typeof requiredStates !== 'undefined') {

            if (!requiredStates.includes(functionCache.current_status)) {
                const message = locale.messages.errors.not_ready
                    .replace(/(\${username})/g, interaction.user.tag)

                await interaction.reply(message)
                return
            }
        }

        const message = interaction.message as Message

        await new CameraSettingHandler().execute(message, interaction.user, buttonData, interaction)
        await new WebsocketHandler().execute(message, interaction.user, buttonData, interaction)
        await new ExcludeConfirmHandler().execute(message, interaction.user, buttonData, interaction)
        await new ModalHandler().execute(message, interaction.user, buttonData, interaction)
        await new PrintJobStartHandler().execute(message, interaction.user, buttonData, interaction)
        await new MessageHandler().execute(message, interaction.user, buttonData, interaction)
        await new EmbedHandler().execute(message, interaction.user, buttonData, interaction)
        await new DeleteHandler().execute(message, interaction.user, buttonData, interaction)
        await new ReconnectHandler().execute(message, interaction.user, buttonData, interaction)
        await new RefreshHandler().execute(message, interaction.user, buttonData, interaction)
        await new ListHandler().execute(message, interaction.user, buttonData, interaction)
        await new PageHandler().execute(message, interaction.user, buttonData, interaction)
        await new MacroHandler().execute(message, interaction.user, buttonData, interaction)
        await new DeleteMessageHandler().execute(message, interaction.user, buttonData, interaction)
        await new SetupHandler().execute(message, interaction.user, buttonData, interaction)
        await new NotificationHandler().execute(message, interaction.user, buttonData, interaction)

        await sleep(2000)

        if (interaction.replied || interaction.deferred) {
            return
        }

        await interaction.reply(localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}