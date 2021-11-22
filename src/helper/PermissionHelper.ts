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
        let commandPermission = this.permissions.commands[command]
        const buttonPermission = this.permissions.buttons[command]
        
        if(typeof buttonPermission !== 'undefined') {
            if(buttonPermission.users === "*") { return true }
            
            commandPermission = this.permissions.commands[buttonPermission.command_assign]
        }
        
        if(typeof commandPermission !== 'undefined' && commandPermission.users === "*") { return true }

        if(this.isController(user,guild)) { return true }

        if(this.hasSectionPermission(user,guild,commandPermission)) { return true }
        if(this.hasSectionPermission(user,guild,buttonPermission)) { return true }

        return false
    }

    protected getMember(user:User, guild: Guild) {
        if(guild === null) {
            return
        }
        return guild.members.cache.get(user.id)
    }

    public hasCommandPermission(user: User, guild: Guild, command:string) {
        const commandPermission = this.permissions.commands[command]
        return this.hasSectionPermission(user, guild, commandPermission)
    }

    protected hasSectionPermission(user: User, guild: Guild, permissions) {
        if(typeof permissions === 'undefined') { return false }
        const member = this.getMember(user, guild)

        if(typeof permissions.users === "string") {
            permissions.users = [permissions.users]
        }
        if(typeof permissions.roles === "string") {
            permissions.roles = [permissions.roles]
        }

        if(permissions.guildadmin && this.isGuildAdmin(user,guild)) {
            return true
        }
        if(permissions.botadmin && this.isBotAdmin(user, guild)) {
            return true
        }
        if(permissions.users.includes(user.id)) { return true }

        if(typeof member !== 'undefined') {
            return member.roles.cache.some((role) => permissions.roles.includes(role.id))
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

