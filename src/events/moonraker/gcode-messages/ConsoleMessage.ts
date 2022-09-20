import {getEntry, setData} from "../../../utils/CacheUtil";
import {ConsoleHelper} from "../../../helper/ConsoleHelper";

export class ConsoleMessage {
    protected cache = getEntry('execute')
    protected consoleHelper = new ConsoleHelper()

    public async parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }
        if(message.method !== 'notify_gcode_response') { return }

        this.cache = getEntry('execute')

        const gcodeResponse = message.params[0]
        const commandToExecute = this.cache.to_execute_command

        let commandFaulty = false

        if(gcodeResponse.includes(commandToExecute)) {
            if(gcodeResponse.startsWith('//')) {
                this.cache.unknown_commands.push(commandToExecute)
                commandFaulty = true
            }
            if(gcodeResponse.startsWith('!!')) {
                this.cache.error_commands.push(commandToExecute)
                commandFaulty = true
            }
        }

        if(!commandFaulty) {
            this.cache.successful_commands.push(commandToExecute)
        }

        setData('execute', this.cache)
    }
}