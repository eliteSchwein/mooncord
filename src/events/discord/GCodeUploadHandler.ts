'use strict'

import {Client, MessageEmbed} from "discord.js";
import {getMoonrakerClient} from "../../Application";
import {ConfigHelper} from "../../helper/ConfigHelper";
import {LocaleHelper} from "../../helper/LocaleHelper";
import {logWarn} from "../../helper/LoggerHelper";
import {PermissionHelper} from "../../helper/PermissionHelper";
import {uploadAttachment} from "../../helper/DataHelper";
import {EmbedHelper} from "../../helper/EmbedHelper";
import {MetadataHelper} from "../../helper/MetadataHelper";

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
            const fileName = attachment.name

            if (!fileName.endsWith('.gcode')) {
                return
            }

            const permissionHelper = new PermissionHelper()

            if (!permissionHelper.hasPermission(message.author, message.guild, 'gcode_upload')) {
                logWarn(`${message.author.tag} doesnt have the permission to upload gcode files!`)
                return;
            }

            const localeHelper = new LocaleHelper()
            const embedHelper = new EmbedHelper()
            const locale = localeHelper.getLocale()

            await message.channel.sendTyping()

            const uploadRequest = await uploadAttachment(attachment)

            if (uploadRequest) {
                const metaDataHelper = new MetadataHelper()
                const metaData = await metaDataHelper.getMetaData(fileName)
                const thumbnail = await metaDataHelper.getThumbnail(fileName)
                const embedData = await embedHelper.generateEmbed('printjob_start_request', metaData)
                const embed = embedData.embed.embeds[0] as MessageEmbed

                embed.setThumbnail(`attachment://${thumbnail.name}`)

                embedData.embed.embeds = [embed]
                embedData.embed['files'] = [thumbnail]

                await message.reply(embedData.embed)
                return
            }

            await message.reply(locale.messages.errors.upload_failed
                .replace(/(\${filename})/g, attachment.name)
                .replace(/(\${username})/g, message.author.tag))
        })
    }
}