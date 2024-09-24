'use strict'

import {Interaction} from "discord.js";
import {PermissionHelper} from "../../../helper/PermissionHelper";
import {LocaleHelper} from "../../../helper/LocaleHelper";
import {getEntry} from "../../../utils/CacheUtil";
import {sleep} from "../../../helper/DataHelper";
import {logNotice, logWarn} from "../../../helper/LoggerHelper";
import {ConfigHelper} from "../../../helper/ConfigHelper";
import * as util from "util"
import {ViewPrintJobSelection} from "./selections/ViewPrintJob";
import {ViewSystemInfo} from "./selections/ViewSystemInfo";
import {ShowTempSelection} from "./selections/ShowTemp";
import {DownloadConfig} from "./selections/DownloadConfig";
import {ExcludeObjectsSelection} from "./selections/ExcludeObjects";
import {DownloadTimelapse} from "./selections/DownloadTimelapse";
import {WebcamChange} from "./selections/WebcamChange";
import {DownloadLogSelection} from "./selections/DownloadLog";

export class SelectInteraction {

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    private async execute(interaction: Interaction) {
        if (!interaction.isStringSelectMenu()) {
            return
        }

        const selectId = interaction.customId
        let logValues = util.format(interaction.values)

        logValues = logValues.slice(2, -1)
            .replace('\n', '')

        if (selectId === null) {
            return
        }

        const permissionHelper = new PermissionHelper()
        const localeHelper = new LocaleHelper()
        const config = new ConfigHelper()

        logNotice(`${interaction.user.tag} pressed selection: ${selectId}`)
        logNotice(`value/s: ${logValues}`)

        if (!permissionHelper.hasPermission(interaction.user, interaction.guild, selectId)) {
            await interaction.reply({
                content: localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        void new ViewPrintJobSelection().executeSelection(interaction, selectId)
        void new ViewSystemInfo().executeSelection(interaction, selectId)
        void new ShowTempSelection().executeSelection(interaction, selectId)
        void new DownloadConfig().executeSelection(interaction, selectId)
        void new ExcludeObjectsSelection().executeSelection(interaction, selectId)
        void new DownloadTimelapse().executeSelection(interaction, selectId)
        void new WebcamChange().executeSelection(interaction, selectId)
        void new DownloadLogSelection().executeSelection(interaction, selectId)

        await sleep(1_000)

        if(!interaction.deferred && !interaction.replied && !interaction.isModalSubmit()) {
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