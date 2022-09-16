import {getMoonrakerClient} from "../Application";
import {EmbedHelper} from "./EmbedHelper";
import {GuildTextBasedChannel} from "discord.js";
import {logRegular} from "./LoggerHelper";
import {getEntry} from "../utils/CacheUtil";

export class ConsoleHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected embedHelper = new EmbedHelper()
    protected cache = getEntry('execute')

    public async executeGcodeCommands(gcodes: string[], channel: GuildTextBasedChannel) {
        if(gcodes.length === 0) {
            return false
        }

        for(const gcode of gcodes) {
            logRegular(`execute gcode "${gcode}" now...`)
            const response = await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}}, 2_000)
            this.cache = getEntry('execute')
            console.log(response)
        }
    }
}