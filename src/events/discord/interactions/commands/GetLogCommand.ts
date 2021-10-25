import {CommandInteraction, Interaction, MessageAttachment} from "discord.js";
import { dump } from "../../../../utils/CacheUtil";
import * as path from "path";
import { ConfigHelper } from "../../../../helper/ConfigHelper";
import axios from "axios";
import { LocaleHelper } from "../../../../helper/LocaleHelper";

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

           // if (bufferSize > Number.parseInt('8000000')) {
            //    answer = this.locale.messages.log_too_large
            //        .replace(/(\${service})/g, `\`${service}\``)
            //    return answer
            //}

            console.log(result.data)

            return result
        } catch (error){
            if(typeof error.code !== 'undefined') {
                return this.locale.messages.errors.log_failed
                    .replace(/(\${service})/g, service)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
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