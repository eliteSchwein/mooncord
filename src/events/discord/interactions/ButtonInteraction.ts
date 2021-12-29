import {Interaction} from "discord.js";
import {RefreshButton} from "./buttons/RefreshButton";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {sleep} from "../../../helper/DataHelper";
import {getEntry} from "../../../utils/CacheUtil";
import {MacroButton} from "./buttons/MacroButton";
import { PageButton } from "./buttons/PageButton";
import {PrintlistButton} from "./buttons/PrintlistButton";
import {PrintRequestButton} from "./buttons/PrintRequestButton";
import {DeleteButton} from "./buttons/DeleteButton";
import {PrintJobStartButton} from "./buttons/PrintJobStartButton";
import {MessageButton} from "./buttons/MessageButton";
import {ReconnectButton} from "./buttons/ReconnectButton";

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
        if(!interaction.isButton()) { return }

        const buttonId = interaction.customId

        if(buttonId === null) { return }

        const buttonData = this.buttonsCache[buttonId]

        logNotice(`${interaction.user.tag} pressed button: ${buttonId}`)

        if(!this.permissionHelper.hasPermission(interaction.user, interaction.guild, buttonId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate() })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        if(typeof buttonData.function_mapping.required_states !== 'undefined') {
            const requiredStates = buttonData.function_mapping.required_states

            if(!requiredStates.includes(this.functionCache.current_status)) {
                const message = this.locale.messages.errors.not_ready
                    .replace(/(\${username})/g, interaction.user.tag)

                await interaction.reply(message)
                return
            }
        }

        await new MessageButton().execute(interaction, buttonData)
        await new DeleteButton().execute(interaction, buttonData)
        await new ReconnectButton().execute(interaction, buttonData)
        await new RefreshButton().execute(interaction, buttonData)
        await new PrintRequestButton().execute(interaction, buttonData)
        await new PrintlistButton().execute(interaction, buttonData)
        await new PageButton().execute(interaction, buttonData)
        await new PrintJobStartButton().execute(interaction, buttonData)
        await new MacroButton().execute(interaction, buttonData)

        await sleep(2000)

        if(interaction.replied || interaction.deferred) { return }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}