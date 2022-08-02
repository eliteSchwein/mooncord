import {ConfigHelper} from "../../../helper/ConfigHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {Interaction} from "discord.js";
import {DiscordInputGenerator} from "../../../generator/DiscordInputGenerator";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {sleep} from "../../../helper/DataHelper";
import {TempTargetModal} from "./modals/TempTargetModal";


export class ModalInteraction {
    protected config = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected permissionHelper = new PermissionHelper()
    protected inputGenerator = new DiscordInputGenerator()

    // @ts-ignore
    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: Interaction) {
        if(!interaction.isModalSubmit()) { return }

        const modalId = interaction.customId

        if(typeof modalId === 'undefined') { return }

        let logFeedback = modalId

        for(const componentsRow of interaction.components) {
            for(const component of componentsRow.components) {
                logFeedback = `${logFeedback} ${component.customId}:${component.value}`
            }
        }

        logNotice(`${interaction.user.tag} submitted modal: ${logFeedback}`)

        if(!this.permissionHelper.hasPermission(interaction.user, interaction.guild, modalId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate() })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${modalId}`)
            return;
        }

        void new TempTargetModal(interaction, modalId)

        await sleep(2000)

        if(interaction.replied || interaction.deferred) { return }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}