'use strict'

import axios from 'axios'
import * as StackTrace from 'stacktrace-js'
import {ConfigHelper} from './ConfigHelper'
import {logEmpty, logError, logRegular} from "./LoggerHelper"

export class APIKeyHelper {

    public async getOneShotToken() {
        const config = new ConfigHelper()
        const apiKey = config.getMoonrakerApiKey()
        const url = config.getMoonrakerUrl()

        if (apiKey === '' || apiKey === undefined) {
            return ''
        }

        logRegular('Retrieve Oneshot Token...')

        try {
            const response = await axios
                .get(`${url}/access/oneshot_token`, {
                    headers: {
                        'X-Api-Key': apiKey
                    },
                    timeout: 500
                })

            return response.data['result']
        } catch (error) {
            const reason = error as string
            const trace = await StackTrace.get()
            logEmpty()
            logError('Token Error:')
            logError(`Url: ${url}/access/oneshot_token`)
            logError(`Error: ${reason}`)
            if (config.traceOnWebErrors()) {
                logError(trace)
            }
            return ''
        }
    }
}