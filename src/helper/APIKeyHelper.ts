import axios from 'axios'
import * as StackTrace from 'stacktrace-js'
import {ConfigHelper} from './ConfigHelper'
import {logRegular, logError, logEmpty} from "./LoggerHelper"

export class APIKeyHelper {
    protected config = new ConfigHelper()

    public async getOneShotToken() {
        const apiKey = this.config.getMoonrakerApiKey()
        const url = this.config.getMoonrakerUrl()

        if (apiKey === '') { return '' }

        logRegular('Retrieve Oneshot Token...')

        try {
            const response = await axios
                .get(`${url}/access/oneshot_token`, {
                    headers: {
                        'X-Api-Key': apiKey
                    }
                })
    
            return response.data['result']
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()
            logEmpty()
            logError('Token Error:')
            logError(`Url: ${url}/access/oneshot_token`)
            logError(`Error: ${reason}`)
            if(this.config.traceOnWebErrors()) {
                logError(trace)
            }
            return ''
        }
    }
}