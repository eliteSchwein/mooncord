import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {removeFromArray} from "../../../../helper/DataHelper";
import {DatabaseUtil} from "../../../../utils/DatabaseUtil";

export class AdminCommand {
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected configHelper = new ConfigHelper()
    protected databaseUtil = new DatabaseUtil()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if (commandId !== 'admin') {
            return
        }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        const role = interaction.options.getRole(this.syntaxLocale.commands.admin.options.role.options.role.name)
        const user = interaction.options.getUser(this.syntaxLocale.commands.admin.options.user.options.user.name)

        console.log(this.databaseUtil.getDatabaseEntry('permissions').admins)
        const permissions = this.configHelper.getPermissions()
        const botAdmins = permissions.botadmins
        const userConfig = this.configHelper.getUserConfig()

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

        userConfig.permission.botadmins = botAdmins

        this.configHelper.writeUserConfig(userConfig)
    }
}