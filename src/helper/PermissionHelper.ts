import {Guild, Permissions, User} from "discord.js";
import {ConfigHelper} from "./ConfigHelper";
import {DatabaseUtil} from "../utils/DatabaseUtil";

export class PermissionHelper {
    protected config = new ConfigHelper()
    protected database = new DatabaseUtil()
    protected permissions = this.database.getDatabaseEntry('permissions')
    protected controllers = this.permissions.controllers
    protected botAdmins = this.permissions.admins

    public constructor() {
        if (typeof this.controllers.users === "string") {
            this.controllers.users = [this.controllers.users]
        }
        if (typeof this.botAdmins.users === "string") {
            this.botAdmins.users = [this.botAdmins.users]
        }

        if (typeof this.controllers.roles === "string") {
            this.controllers.roles = [this.controllers.roles]
        }
    }

    public hasPermission(user: User, guild: Guild, command: string) {
        let commandPermission = this.permissions.commands[command]
        const buttonPermission = this.permissions.buttons[command]
        const selectPermission = this.permissions.selections[command]
        const modalPermission = this.permissions.modals[command]
        const reactPermission = this.permissions.reactions[command]

        if (typeof reactPermission !== 'undefined') {
            if (reactPermission.users === "*") {
                return true
            }

            commandPermission = this.permissions.commands[reactPermission.command_assign]
        }

        if (typeof buttonPermission !== 'undefined') {
            if (buttonPermission.users === "*") {
                return true
            }

            commandPermission = this.permissions.commands[buttonPermission.command_assign]
        }

        if (typeof selectPermission !== 'undefined') {
            if (selectPermission.users === "*") {
                return true
            }

            commandPermission = this.permissions.commands[selectPermission.command_assign]
        }

        if (typeof modalPermission !== 'undefined') {
            if (modalPermission.users === "*") {
                return true
            }

            commandPermission = this.permissions.commands[modalPermission.command_assign]
        }

        if (typeof commandPermission !== 'undefined' && commandPermission.users === "*") {
            return true
        }

        if (this.isController(user, guild)) {
            return true
        }

        if (this.hasSectionPermission(user, guild, commandPermission)) {
            return true
        }
        if (this.hasSectionPermission(user, guild, buttonPermission)) {
            return true
        }
        if (this.hasSectionPermission(user, guild, selectPermission)) {
            return true
        }
        if (this.hasSectionPermission(user, guild, modalPermission)) {
            return true
        }

        return false
    }

    public hasCommandPermission(user: User, guild: Guild, command: string) {
        const commandPermission = this.permissions.commands[command]
        return this.hasSectionPermission(user, guild, commandPermission)
    }

    public isGuildAdmin(user: User, guild: Guild) {
        const member = this.getMember(user, guild)

        if (typeof member !== 'undefined') {
            return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR, true)
        }
    }

    public isBotAdmin(user: User, guild: Guild) {
        const member = this.getMember(user, guild)

        if (this.botAdmins.users.includes(user.id)) {
            return true
        }

        if (typeof member === 'undefined') {
            return
        }

        return member.roles.cache.some((role) => this.botAdmins.roles.includes(role.id))
    }

    public isController(user: User, guild: Guild) {
        const member = this.getMember(user, guild)
        if (this.controllers.users.includes(user.id)) {
            return true
        }

        if (typeof member !== 'undefined') {
            return member.roles.cache.some((role) => this.controllers.roles.includes(role.id))
        }
    }

    protected getMember(user: User, guild: Guild) {
        if (guild === null) {
            return
        }
        return guild.members.cache.get(user.id)
    }

    protected hasSectionPermission(user: User, guild: Guild, permissions) {
        if (typeof permissions === 'undefined') {
            return false
        }
        const member = this.getMember(user, guild)

        if (typeof permissions.users === "string") {
            permissions.users = [permissions.users]
        }
        if (typeof permissions.roles === "string") {
            permissions.roles = [permissions.roles]
        }

        if (permissions.guildadmin && this.isGuildAdmin(user, guild)) {
            return true
        }
        if (permissions.botadmin && this.isBotAdmin(user, guild)) {
            return true
        }
        if (permissions.users.includes(user.id)) {
            return true
        }

        if (typeof member !== 'undefined') {
            return member.roles.cache.some((role) => permissions.roles.includes(role.id))
        }
    }
}

