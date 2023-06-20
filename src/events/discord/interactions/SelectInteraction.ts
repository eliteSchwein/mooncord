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

export class SelectInteraction {
    protected permissionHelper = new PermissionHelper()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected selectionsCache = getEntry('selections')
    protected functionCache = getEntry('function')
    protected config = new ConfigHelper()

    public constructor(interaction: Interaction) {
        void this.execute(interaction)
    }

    protected async execute(interaction: Interaction) {
        if (!interaction.isSelectMenu()) {
            return
        }

        const selectId = interaction.customId
        let logValues = util.format(interaction.values)

        logValues = logValues.slice(2, -1)
            .replace('\n', '')

        if (selectId === null) {
            return
        }

        const selectData = this.selectionsCache[selectId]

        logNotice(`${interaction.user.tag} pressed selection: ${selectId}`)
        logNotice(`value/s: ${logValues}`)

        if (!this.permissionHelper.hasPermission(interaction.user, interaction.guild, selectId)) {
            await interaction.reply({
                content: this.localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: this.config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        void new ViewPrintJobSelection(interaction, selectId)
        void new ViewSystemInfo(interaction, selectId)
        void new ShowTempSelection(interaction, selectId)
        void new DownloadConfig(interaction, selectId)
        void new ExcludeObjectsSelection(interaction, selectId)
        void new DownloadTimelapse(interaction, selectId)

        await sleep(2000)

        if (interaction.replied || interaction.deferred || interaction.isModalSubmit()) {
            return
        }

        await interaction.reply(this.localeHelper.getCommandNotReadyError(interaction.user.tag))
    }

}