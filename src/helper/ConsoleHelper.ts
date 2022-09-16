import {getMoonrakerClient} from "../Application";
import {EmbedHelper} from "./EmbedHelper";
import {GuildTextBasedChannel} from "discord.js";
import {logRegular} from "./LoggerHelper";
import {getEntry, setData} from "../utils/CacheUtil";

export class ConsoleHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected embedHelper = new EmbedHelper()
    protected cache = getEntry('execute')

    public async executeGcodeCommands(gcodes: string[], channel: GuildTextBasedChannel) {
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
            this.cache = getEntry('execute')
        }
    }
}