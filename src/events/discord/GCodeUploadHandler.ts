import {Client} from "discord.js";
import {getMoonrakerClient} from "../../Application";
import axios from "axios";
import FormData from "form-data"
import {ConfigHelper} from "../../helper/ConfigHelper";
import {LocaleHelper} from "../../helper/LocaleHelper";
import {logError, logWarn} from "../../helper/LoggerHelper";
import {PermissionHelper} from "../../helper/PermissionHelper";

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
            const filename = attachment.name

            if(!url.endsWith('.gcode')) { return }

            if(!this.permissionHelper.hasPermission(message.author, message.guild, 'gcode_upload')) {
                logWarn(`${message.author.tag} doesnt have the permission to upload gcode files!`)
                return;
            }

            try {
                const gcodeData = await axios.get(url,
                {responseType: 'arraybuffer'})

                const formData = new FormData()

                formData.append('file', gcodeData.data, filename)

                await axios.post(`${this.configHelper.getMoonrakerUrl()}/server/files/upload`,
                    formData,
                    {
                        'maxContentLength': Infinity,
                        'maxBodyLength': Infinity,
                        headers: {
                            'X-Api-Key': this.configHelper.getMoonrakerApiKey(),
                            'Content-Type': `multipart/form-data; boundary=${formData['_boundary']}`
                        }})
                await message.react('✅')
            } catch (error) {
                await message.reply({content: this.locale.messages.errors.command_failed})
                logError(`Upload for ${filename} failed:`)
                logError(error)
            }
        })
    }
}