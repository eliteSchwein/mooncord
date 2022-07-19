import {Client} from "discord.js";
import {getMoonrakerClient} from "../../Application";
import axios from "axios";
import FormData from "form-data"
import {ConfigHelper} from "../../helper/ConfigHelper";
import {LocaleHelper} from "../../helper/LocaleHelper";
import {logError, logWarn} from "../../helper/LoggerHelper";
import {PermissionHelper} from "../../helper/PermissionHelper";
import {uploadAttachment} from "../../helper/DataHelper";

export class GCodeUploadHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected permissionHelper = new PermissionHelper()
    protected locale = this.localeHelper.getLocale()

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) { return }
            if (message.attachments.size === 0) { return }

            const attachment = message.attachments.at(0)
            const url = attachment.url

            if(!url.endsWith('.gcode')) { return }

            if(!this.permissionHelper.hasPermission(message.author, message.guild, 'gcode_upload')) {
                logWarn(`${message.author.tag} doesnt have the permission to upload gcode files!`)
                return;
            }

            const uploadRequest = await uploadAttachment(attachment)

            if(uploadRequest) {
                await message.react('✅')
                return
            }

            await message.reply(this.locale.messages.errors.upload_failed
                .replace(/(\${filename})/g, attachment.name)
                .replace(/(\${username})/g, message.author.tag))
        })
    }
}