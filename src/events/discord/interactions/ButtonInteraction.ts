import {Interaction} from "discord.js";
import {RefreshButton} from "./buttons/RefreshButton";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {sleep} from "../../../helper/DataHelper";

export class ButtonInteraction {
    protected config = new ConfigHelper()
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: Interaction) {
        if(!interaction.isButton()) { return }

        const buttonId = interaction.customId

        if(buttonId === null) { return }

        logNotice(`${interaction.user.tag} pressed button: ${buttonId}`)

        if(!this.permissionHelper.hasPermission(interaction.user, interaction.guild, buttonId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate() })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        void new RefreshButton(interaction, buttonId)

        await sleep(1500)

        if(interaction.replied || interaction.deferred) { return }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}