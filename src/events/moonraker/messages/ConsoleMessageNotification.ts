import {getEntry, setData} from "../../../utils/CacheUtil";
import {ConsoleHelper} from "../../../helper/ConsoleHelper";

export class ConsoleMessageNotification {
    protected cache = getEntry('execute')
    protected consoleHelper = new ConsoleHelper()

    public async parse(message) {
        if(typeof(message.method) === 'undefined') { return }
        if(typeof(message.params) === 'undefined') { return }
        if(message.method !== 'notify_gcode_response') { return }

        const gcodeResponse = message.params[0]

        console.log(this.cache.to_execute_command)
        console.log(gcodeResponse)

        let commandFaulty = false

        if(gcodeResponse.includes(this.cache.to_execute_command)) {
            if(gcodeResponse.startsWith('//')) {
                this.cache.unknown_commands.push(this.cache.to_execute_command)
                commandFaulty = true
            }
            if(gcodeResponse.startsWith('!!')) {
                this.cache.error_commands.push(this.cache.to_execute_command)
                commandFaulty = true
            }
        }

        if(!commandFaulty) {
            return
        }

        setData('execute', this.cache)
    }
}