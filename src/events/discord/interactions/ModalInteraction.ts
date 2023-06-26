'use strict'

import {ConfigHelper} from "../../../helper/ConfigHelper";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {Interaction} from "discord.js";
import {DiscordInputGenerator} from "../../../generator/DiscordInputGenerator";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {sleep} from "../../../helper/DataHelper";
import {TempTargetModal} from "./modals/TempTargetModal";
import {ExecuteModal} from "./modals/ExecuteModal";


export class ModalInteraction {

    // @ts-ignore
    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    private async execute(interaction: Interaction) {
        if (!interaction.isModalSubmit()) {
            return
        }

        const modalId = interaction.customId

        if (typeof modalId === 'undefined') {
            return
        }

        let logFeedback = modalId

        for (const componentsRow of interaction.components) {
            for (const component of componentsRow.components) {
                logFeedback = `${logFeedback} ${component.customId}:${component.value}`
            }
        }

        const config = new ConfigHelper()
        const localeHelper = new LocaleHelper()
        const permissionHelper = new PermissionHelper()
        const inputGenerator = new DiscordInputGenerator()

        logNotice(`${interaction.user.tag} submitted modal: ${logFeedback}`)

        if (!permissionHelper.hasPermission(interaction.user, interaction.guild, modalId)) {
            await interaction.reply({
                content: localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${modalId}`)
            return;
        }

        void new TempTargetModal(interaction, modalId)
        void new ExecuteModal(interaction, modalId)

        await sleep(2000)

        if (interaction.replied || interaction.deferred) {
            return
        }

        await interaction.reply(localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}