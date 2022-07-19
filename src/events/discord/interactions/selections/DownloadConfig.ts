import {MessageAttachment, SelectMenuInteraction} from "discord.js";
import {logError, logRegular, logSuccess} from "../../../../helper/LoggerHelper";
import axios from "axios";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {getDatabase} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";

export class DownloadConfig {
    protected databaseUtil = getDatabase()
    protected localeHelper = new LocaleHelper()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected locale = this.localeHelper.getLocale()
    protected config = new ConfigHelper()

    public constructor(interaction: SelectMenuInteraction, selectionId: string) {
        if(selectionId !== 'config_file_download') { return }

        void this.execute(interaction)
    }

    protected async execute(interaction: SelectMenuInteraction) {
        await interaction.deferReply({ephemeral: true})

        const file = interaction.values[0]

        await interaction.editReply(await this.retrieveConfig(file))
    }

    private async retrieveConfig(config: string) {

        logRegular(`downloading config for ${config}...`)

        try {
            const result = await axios.get(`${this.config.getMoonrakerUrl()}/server/files/config/${config}`,{
                responseType: 'arraybuffer',
                headers: {
                    'X-Api-Key': this.config.getMoonrakerApiKey()
                }
            })

            const bufferSize = Buffer.byteLength(<Buffer>result.data)

            if (bufferSize > Number.parseInt('8000000')) {
                logError(`Configuration ${config} to big, Configfile: ${bufferSize}byte Limit: 8000000byte`)
                return this.locale.messages.errors.config_too_large
                    .replace(/(\${config})/g, `\`${config}\``)
            }

            const attachment = new MessageAttachment(<Buffer>result.data, `${config}`)

            logSuccess(`Configuration ${config} Download successful!`)
            return { files: [attachment] }
        } catch (error) {
            if(typeof error.code !== 'undefined') {
                logError(`${config} Config Download failed: ${error.config.url}: ${error.code}`)
                return this.locale.messages.errors.config_failed
                    .replace(/(\${config})/g, config)
                    .replace(/(\${reason})/g, `${error.code}`)
            }
            logError(`${config} Config Download failed: ${error.config.url}: ${error.response.status} ${error.response.statusText}`)
            if(error.response.status === 404) {
                return this.locale.messages.errors.config_not_found
                    .replace(/(\${config})/g, config)
            }
            return this.locale.messages.errors.config_failed
                .replace(/(\${config})/g, config)
                .replace(/(\${reason})/g, `${error.response.status} ${error.response.statusText}`)
        }
    }
}