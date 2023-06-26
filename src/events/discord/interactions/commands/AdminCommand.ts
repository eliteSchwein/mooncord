'use strict'

import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {removeFromArray} from "../../../../helper/DataHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";

export class AdminCommand {

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'admin') {
            return
        }

        this.execute(interaction)
    }

    private async execute(interaction: CommandInteraction) {
        const databaseUtil = new DatabaseUtil()
        const localeHelper = new LocaleHelper()
        const syntaxLocale = localeHelper.getSyntaxLocale()
        const locale = localeHelper.getLocale()

        const role = interaction.options.getRole(syntaxLocale.commands.admin.options.role.options.role.name)
        const user = interaction.options.getUser(syntaxLocale.commands.admin.options.user.options.user.name)

        const permissions = databaseUtil.getDatabaseEntry('permissions')
        const botAdmins = permissions.admins

        const section = (role === null) ? 'users' : 'roles'
        const id = (role === null) ? user.id : role.id
        const mention = (role === null) ? user.tag : role.name

        if (botAdmins[section].includes(id)) {
            removeFromArray(botAdmins[section], id)

            const message = locale.messages.answers.admin.removed
                .replace(/(\${username})/g, interaction.user.tag)
                .replace(/(\${mention})/g, mention)

            await interaction.reply(message)
        } else {
            botAdmins[section].push(id)

            const message = locale.messages.answers.admin.added
                .replace(/(\${username})/g, interaction.user.tag)
                .replace(/(\${mention})/g, mention)

            await interaction.reply(message)
        }

        permissions.admins = botAdmins

        await databaseUtil.updateDatabaseEntry('permissions', permissions)
    }
}