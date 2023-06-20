'use strict'

import {getMoonrakerClient} from "../Application";
import {EmbedHelper} from "./EmbedHelper";
import {GuildTextBasedChannel} from "discord.js";
import {logRegular, logWarn} from "./LoggerHelper";
import {getEntry, setData} from "../utils/CacheUtil";

export class ConsoleHelper {
    protected moonrakerClient = getMoonrakerClient()
    protected embedHelper = new EmbedHelper()
    protected cache = getEntry('execute')

    public async executeGcodeCommands(gcodes: string[], channel: GuildTextBasedChannel, showExecuted = true) {
        let valid = 1

        if (gcodes.length === 0) {
            return 0
        }

        this.cache = getEntry('execute')

        if (this.cache.running) {
            return -1
        }

        this.cache = {
            'running': true,
            'to_execute_command': '',
            'command_state': '',
            'successful_commands': [],
            'error_commands': [],
            'unknown_commands': []
        }

        setData('execute', this.cache)

        for (let gcode of gcodes) {
            gcode = gcode.toUpperCase()
            logRegular(`execute gcode "${gcode}" now...`)
            this.cache.to_execute_command = gcode
            setData('execute', this.cache)

            try {
                await this.moonrakerClient.send({"method": "printer.gcode.script", "params": {"script": gcode}}, 2_000)
            } catch {
                logWarn(`Command ${gcode} timed out...`)
            }

            if (!this.cache.error_commands.includes(gcode) && !this.cache.unknown_commands.includes(gcode)) {
                this.cache.successful_commands.push(gcode)
            }

            setData('execute', this.cache)

            this.cache = getEntry('execute')
        }

        this.cache = getEntry('execute')

        if (this.cache.error_commands.length > 0) {
            valid = 0

            const failedDescription = `\`\`\`${this.cache.error_commands.join('\n')}\`\`\``
            const failedEmbed = await this.embedHelper.generateEmbed('execute_error', {gcode_commands: failedDescription})
            await channel.send(failedEmbed.embed)
        }

        if (this.cache.unknown_commands.length > 0) {
            valid = 0

            const unknownDescription = `\`\`\`${this.cache.unknown_commands.join('\n')}\`\`\``
            const unknownEmbed = await this.embedHelper.generateEmbed('execute_unknown', {gcode_commands: unknownDescription})
            await channel.send(unknownEmbed.embed)
        }

        if (this.cache.successful_commands.length > 0 && showExecuted) {
            const successfulDescription = `\`\`\`${this.cache.successful_commands.join('\n')}\`\`\``
            const successfulEmbed = await this.embedHelper.generateEmbed('execute_successful', {gcode_commands: successfulDescription})
            await channel.send(successfulEmbed.embed)
        }

        this.cache.running = false

        setData('execute', this.cache)

        return valid
    }
}