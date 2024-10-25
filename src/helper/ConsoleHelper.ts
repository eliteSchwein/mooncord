'use strict'

import {getMoonrakerClient} from "../Application";
import {EmbedHelper} from "./EmbedHelper";
import {GuildTextBasedChannel} from "discord.js";
import {logRegular, logWarn} from "./LoggerHelper";
import {getEntry, setData} from "../utils/CacheUtil";

export class ConsoleHelper {
    public async executeGcodeCommands(gcodes: string[], channel: GuildTextBasedChannel, showExecuted = true) {
        let valid = 1

        if (gcodes.length === 0) {
            return 0
        }

        const moonrakerClient = getMoonrakerClient()
        const embedHelper = new EmbedHelper()

        let cache = getEntry('execute')

        if (cache.running) {
            return -1
        }

        cache = {
            'running': true,
            'to_execute_command': '',
            'command_state': '',
            'successful_commands': [],
            'error_commands': [],
            'unknown_commands': []
        }

        setData('execute', cache)

        for (let gcode of gcodes) {
            gcode = gcode.toUpperCase()
            logRegular(`execute gcode "${gcode}" now...`)
            cache.to_execute_command = gcode
            setData('execute', cache)

            try {
                await moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}}, 2_000)
            } catch {
                logWarn(`Command ${gcode} timed out...`)
            }

            if (!cache.error_commands.includes(gcode) && !cache.unknown_commands.includes(gcode)) {
                cache.successful_commands.push(gcode)
            }

            setData('execute', cache)

            cache = getEntry('execute')
        }

        cache = getEntry('execute')

        if (cache.error_commands.length > 0) {
            valid = 0

            const failedDescription = `\`\`\`${cache.error_commands.join('\n')}\`\`\``
            const failedEmbed = await embedHelper.generateEmbed('execute_error', {gcode_commands: failedDescription})
            await channel.send(failedEmbed.embed)
        }

        if (cache.unknown_commands.length > 0) {
            valid = 0

            const unknownDescription = `\`\`\`${cache.unknown_commands.join('\n')}\`\`\``
            const unknownEmbed = await embedHelper.generateEmbed('execute_unknown', {gcode_commands: unknownDescription})
            await channel.send(unknownEmbed.embed)
        }

        cache.running = false

        setData('execute', cache)

        return valid
    }
}