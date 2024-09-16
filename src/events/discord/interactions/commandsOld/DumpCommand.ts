'use strict'

import {CommandInteraction, MessageAttachment} from "discord.js";
import * as CacheUtil from "../../../../utils/CacheUtil";
import * as path from "path";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class DumpCommand {
    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'dump') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const databaseUtil = getDatabase()
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()

        await interaction.deferReply({ephemeral: true})

        const sectionArgument = interaction.options.getString(syntaxLocale.commands.dump.options.section.name)

        if (sectionArgument === 'cache') {
            void await CacheUtil.dump()
        } else if (sectionArgument === 'database') {
            void await databaseUtil.dump()
        }

        const attachment = new MessageAttachment(path.resolve(__dirname, `../${sectionArgument}_dump.json`), `${sectionArgument}.json`)

        await interaction.editReply({files: [attachment]})
    }
}