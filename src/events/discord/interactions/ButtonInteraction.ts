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
import {TempModalHandler} from "./handlers/TempModalHandler";
import {ExcludeConfirmHandler} from "./handlers/ExcludeConfirmHandler";
import {WebsocketHandler} from "./handlers/WebsocketHandler";
import {DeleteHandler} from "./handlers/DeleteHandler";
import {EmbedHandler} from "./handlers/EmbedHandler";
import {DeleteMessageHandler} from "./handlers/DeleteMessageHandler";

export class ButtonInteraction {
    protected config = new ConfigHelper()
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected buttonsCache = getEntry('buttons')
    protected functionCache = getEntry('function')

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: Interaction) {
        if (!interaction.isButton()) {
            return
        }

        const buttonId = interaction.customId

        if (buttonId === null) {
            return
        }

        const buttonData = this.buttonsCache[buttonId]

        logNotice(`${interaction.user.tag} pressed button: ${buttonId}`)

        if (!this.permissionHelper.hasPermission(interaction.user, interaction.guild, buttonId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        if (typeof buttonData.function_mapping.required_states !== 'undefined') {
            const requiredStates = buttonData.function_mapping.required_states

            if (!requiredStates.includes(this.functionCache.current_status)) {
                const message = this.locale.messages.errors.not_ready
                    .replace(/(\${username})/g, interaction.user.tag)

                await interaction.reply(message)
                return
            }
        }

        const message = interaction.message as Message

        await new WebsocketHandler().execute(message, interaction.user, buttonData, interaction)
        await new ExcludeConfirmHandler().execute(message, interaction.user, buttonData, interaction)
        await new TempModalHandler().execute(message, interaction.user, buttonData, interaction)
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

        await sleep(2000)

        if (interaction.replied || interaction.deferred) {
            return
        }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}