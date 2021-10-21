import {Guild, Permissions, User} from "discord.js";
import {ConfigHelper} from "./ConfigHelper";

export class PermissionHelper {
    protected config = new ConfigHelper()
    protected permissions = this.config.getPermissions()
    protected controllers = this.permissions.controllers
    protected botAdmins = this.permissions.botadmins
    public constructor() {
        if(typeof this.controllers.users === "string") {
            this.controllers.users = [this.controllers.users]
        }
        if(typeof this.botAdmins.users === "string") {
            this.botAdmins.users = [this.botAdmins.users]
        }

        if(typeof this.controllers.roles === "string") {
            this.controllers.roles = [this.controllers.roles]
        }
    }
    public hasPermission(user: User, guild: Guild, command: string) {
        const commandPermission = this.permissions.commands[command]

        if(commandPermission.users === "*") { return true }

        if(this.isController(user,guild)) { return true }

        if(this.hasCommandPermission(user,guild,command)) { return true }

        return false
    }

    protected getMember(user:User, guild: Guild) {
        if(guild === null) {
            return
        }
        return guild.members.cache.get(user.id)
    }

    public hasCommandPermission(user: User, guild: Guild, command: string) {
        const commandPermission = this.permissions.commands[command]
        const member = this.getMember(user, guild)

        if(typeof commandPermission.users === "string") {
            commandPermission.users = [commandPermission.users]
        }
        if(typeof commandPermission.roles === "string") {
            commandPermission.roles = [commandPermission.roles]
        }

        if(commandPermission.guildadmin && this.isGuildAdmin(user,guild)) {
            return true
        }
        if(commandPermission.botadmin && this.isBotAdmin(user, guild)) {
            return true
        }
        if(commandPermission.users.includes(user.id)) { return true }

        if(typeof member !== 'undefined') {
            return member.roles.cache.some((role) => commandPermission.roles.includes(role.id))
        }
    }

     public isGuildAdmin(user: User, guild: Guild) {
        const member = this.getMember(user, guild)

        if(typeof member !== 'undefined') {
            return member.permissions.has(Permissions.FLAGS.ADMINISTRATOR, true)
        }
    }

    public isBotAdmin(user: User, guild: Guild) {
        const member = this.getMember(user, guild)

        if(this.botAdmins.users.includes(user.id)) { return true }

        if(typeof member === 'undefined') { return }

        const roles = this.botAdmins.guilds[guild.id]

        return member.roles.cache.some((role) => roles.includes(role.id))
    }

    public isController(user: User, guild: Guild) {
        const member = this.getMember(user, guild)
        if(this.controllers.users.includes(user.id)) {
            return true
        }

        if(typeof member !== 'undefined') {
            return member.roles.cache.some((role) => this.controllers.roles.includes(role.id))
        }
    }
}

