import {getMoonrakerClient} from "../Application";
import {EmbedHelper} from "./EmbedHelper";
import {GuildTextBasedChannel} from "discord.js";
import {logRegular} from "./LoggerHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {sleep} from "./DataHelper";

export class ConsoleHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected embedHelper = new EmbedHelper()
    protected cache = getEntry('execute')

    public async executeGcodeCommands(gcodes: string[], channel: GuildTextBasedChannel) {
        let valid = true

        if(gcodes.length === 0) {
            return false
        }

        setData('execute', {
            'running': false,
            'to_execute_command': '',
            'command_state': '',
            'successful_commands': [],
            'failed_commands': [],
            'unknown_commands': []
        })

        for(let gcode of gcodes) {
            gcode = gcode.toUpperCase()
            logRegular(`execute gcode "${gcode}" now...`)
            this.cache.to_execute_command = gcode
            setData('execute', this.cache)
            await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}}, 2_000)
            await sleep(150)
            this.cache = getEntry('execute')
        }

        if(this.cache.error_commands.length > 0) {
            valid = false

            const failedDescription = `\`\`\`
${this.cache.error_commands.join('\n')}
            \`\`\``
            const failedEmbed = await this.embedHelper.generateEmbed('execute_error', {gcode_commands: failedDescription})
            await channel.send(failedEmbed.embed)
        }

        if(this.cache.unknown_commands.length > 0) {
            valid = false

            const unknownDescription = `\`\`\`
${this.cache.unknown_commands.join('\n')}
            \`\`\``
            const unknownEmbed = await this.embedHelper.generateEmbed('execute_unknown', {gcode_commands: unknownDescription})
            await channel.send(unknownEmbed.embed)
        }

        return valid
    }
}