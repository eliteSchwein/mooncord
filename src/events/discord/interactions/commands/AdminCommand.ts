import BaseCommand from "../abstracts/BaseCommand";
import {ChatInputCommandInteraction} from "discord.js";
import {removeFromArray} from "../../../../helper/DataHelper";

export default class AdminCommand extends BaseCommand {
    commandId = 'admin'

    async handleCommand(interaction: ChatInputCommandInteraction) {
        interaction.options
        const role = interaction.options.getRole(this.syntaxLocale.commands.admin.options.role.options.role.name)
        const user = interaction.options.getUser(this.syntaxLocale.commands.admin.options.user.options.user.name)

        const permissions = this.database.getDatabaseEntry('permissions')
        const botAdmins = permissions.admins

        const section = (role === null) ? 'users' : 'roles'
        const id = (role === null) ? user.id : role.id
        const mention = (role === null) ? user.tag : role.name

        if (botAdmins[section].includes(id)) {
            removeFromArray(botAdmins[section], id)

            const message = this.locale.messages.answers.admin.removed
                .replace(/(\${username})/g, interaction.user.tag)
                .replace(/(\${mention})/g, mention)

            await interaction.reply(message)
        } else {
            botAdmins[section].push(id)

            const message = this.locale.messages.answers.admin.added
                .replace(/(\${username})/g, interaction.user.tag)
                .replace(/(\${mention})/g, mention)

            await interaction.reply(message)
        }

        permissions.admins = botAdmins

        await this.database.updateDatabaseEntry('permissions', permissions)
    }
}