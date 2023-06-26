'use strict'

import {Client} from "discord.js";
import {getMoonrakerClient} from "../../Application";
import {ConfigHelper} from "../../helper/ConfigHelper";
import {LocaleHelper} from "../../helper/LocaleHelper";
import {logWarn} from "../../helper/LoggerHelper";
import {PermissionHelper} from "../../helper/PermissionHelper";
import {uploadAttachment} from "../../helper/DataHelper";

export class GCodeUploadHandler {

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) {
                return
            }
            if (message.attachments.size === 0) {
                return
            }

            const attachment = message.attachments.at(0)
            const url = attachment.url

            if (!url.endsWith('.gcode')) {
                return
            }

            const moonrakerClient = getMoonrakerClient()
            const configHelper = new ConfigHelper()
            const localeHelper = new LocaleHelper()
            const permissionHelper = new PermissionHelper()
            const locale = localeHelper.getLocale()

            if (!permissionHelper.hasPermission(message.author, message.guild, 'gcode_upload')) {
                logWarn(`${message.author.tag} doesnt have the permission to upload gcode files!`)
                return;
            }

            const uploadRequest = await uploadAttachment(attachment)

            if (uploadRequest) {
                await message.react('✅')
                return
            }

            await message.reply(locale.messages.errors.upload_failed
                .replace(/(\${filename})/g, attachment.name)
                .replace(/(\${username})/g, message.author.tag))
        })
    }
}