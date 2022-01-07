import {CommandInteraction, MessageAttachment} from "discord.js";
import { ConfigHelper } from "../../../../helper/ConfigHelper";
import axios from "axios";
import { LocaleHelper } from "../../../../helper/LocaleHelper";
import {logError, logSuccess} from "../../../../helper/LoggerHelper";

export class GetLodCommand {
    protected config = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'get_log') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ephemeral: true})

        const service = interaction.options.getString(this.syntaxLocale.commands.get_log.options.log_file.name)

        const request = await this.retrieveLog(service)

        await interaction.editReply(request)
    }

    protected async retrieveLog(service: string) {
        try {
            const result = await axios.get(`${this.config.getMoonrakerUrl()}/server/files/${service}.log`,{
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': this.config.getMoonrakerApiKey()
                }
            })

            const bufferSize = Buffer.byteLength(<Buffer>result.data)

            if (bufferSize > Number.parseInt('8000000')) {
                logError(`${service} Log to big, Logfile: ${bufferSize}byte Limit: 8000000byte`)
                return this.locale.messages.errors.log_too_large
                    .replace(/(\${service})/g, `\`${service}\``)
            }

            const attachment = new MessageAttachment(<Buffer>result.data, `${service}.log`)

            logSuccess(`${service} Log Download successful!`)
            return { files: [attachment] }
        } catch (error){
            if(typeof error.code !== 'undefined') {
                logError(`${service} Log Download failed: ${error.config.url}: ${error.code}`)
                return this.locale.messages.errors.log_failed
                    .replace(/(\${service})/g, service)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${service} Log Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if(error.response.status === 404) {
                return this.locale.messages.errors.log_not_found
                    .replace(/(\${service})/g, service)
            }
            return this.locale.messages.errors.log_failed
                .replace(/(\${service})/g, service)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}