'use strict'

import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class DumpCommand {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'dump') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ephemeral: true})

        const sectionArgument = interaction.options.getString(this.syntaxLocale.commands.dump.options.section.name)

        if (sectionArgument === 'cache') {
            void await CacheUtil.dump()
        } else if (sectionArgument === 'database') {
            void await this.databaseUtil.dump()
        }

        const attachment = new MessageAttachment(path.resolve(__dirname, `../${sectionArgument}_dump.json`), `${sectionArgument}.json`)

        await interaction.editReply({files: [attachment]})
    }
}