'use strict'

import {Guild, User} from "discord.js";
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
        if (typeof this.botAdmins.roles === "string") {
            this.botAdmins.roles = [this.botAdmins.roles]
        }
    }

    public hasPermission(user: User, guild: Guild, command: string) {
        let commandPermission = this.config.getEntriesByFilter(new RegExp(`^command ${command}`, 'g'))[0]
        const buttonPermission = this.config.getEntriesByFilter(new RegExp(`^button ${command}`, 'g'))[0]
        const selectPermission = this.config.getEntriesByFilter(new RegExp(`^select_menu ${command}`, 'g'))[0]
        const modalPermission = this.config.getEntriesByFilter(new RegExp(`^modal ${command}`, 'g'))[0]
        const reactPermission = this.config.getEntriesByFilter(new RegExp(`^reaction ${command}`, 'g'))[0]

        if (typeof reactPermission !== 'undefined') {
            if (reactPermission.users === "*") {
                return true
            }
        }

        if (typeof buttonPermission !== 'undefined') {
            if (buttonPermission.users === "*") {
                return true
            }
        }

        if (typeof selectPermission !== 'undefined') {
            if (selectPermission.users === "*") {
                return true
            }
        }

        if (typeof modalPermission !== 'undefined') {
            if (modalPermission.users === "*") {
                return true
            }
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
            return member.permissions.has('Administrator', true)
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

        const roles = this.botAdmins.roles

        for (const role of member.roles.cache) {
            if (roles.includes(role[1].id)) {
                return true
            }
        }

        return false
    }

    public isController(user: User, guild: Guild) {
        return this.controllers.includes(user.id);
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

        if (permissions.guild_admin && this.isGuildAdmin(user, guild)) {
            return true
        }
        if (permissions.bot_admin && this.isBotAdmin(user, guild)) {
            return true
        }
        if (permissions.users.includes(user.id)) {
            return true
        }

        if (typeof member !== 'undefined') {
            const roles = this.botAdmins.roles

            for (const role of member.roles.cache) {
                if (roles.includes(role[1].id)) {
                    return true
                }
            }

            return false
        }
    }
}

