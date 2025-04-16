'use strict'

import {PermissionHelper} from "../../../helper/PermissionHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {Interaction} from "discord.js";
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

        const localeHelper = new LocaleHelper()
        const permissionHelper = new PermissionHelper()

        logNotice(`${interaction.user.tag} submitted modal: ${logFeedback}`)

        if (!permissionHelper.hasPermission(interaction.user, interaction.guild, modalId)) {
            await permissionHelper.sendNoPermissionMessage(interaction)
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${modalId}`)
            return;
        }

        void new TempTargetModal().executeModal(interaction, modalId)
        void new ExecuteModal().executeModal(interaction, modalId)

        await sleep(1_000)

        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply(localeHelper.getCommandNotReadyError(interaction.user.tag))
            return
        }

        await sleep(60_000)

        if (interaction.replied) {
            return
        }

        await interaction.editReply(localeHelper.getCommandNotReadyError(interaction.user.tag))
    }
}