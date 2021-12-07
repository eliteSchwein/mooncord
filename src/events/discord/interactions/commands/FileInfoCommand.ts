import {CommandInteraction} from "discord.js";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {MetadataHelper} from "../../../../helper/MetadataHelper";

export class FileInfoCommand {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected syntaxLocale = this.localeHelper.getSyntaxLocale()
    protected metadataHelper = new MetadataHelper()

    public constructor(interaction: CommandInteraction, commandId: string) {
        if(commandId !== 'fileinfo') { return }

        this.execute(interaction)
    }

    protected async execute(interaction: CommandInteraction) {
        let filename = interaction.options.getString(this.syntaxLocale.commands.printlist.options.file.name)

        if(!filename.endsWith('.gcode')) {
            filename = `${filename}.gcode`
        }

        const metadata = await this.metadataHelper.getMetaData(filename)

        console.log(metadata)
    }
}