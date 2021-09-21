import axios from 'axios'
import {ConfigHelper} from './ConfigHelper'
import {ConsoleLogger} from './ConsoleLogger'

const logger = new ConsoleLogger()

export class APIKeyHelper {
    protected config = new ConfigHelper()

    public async getOneShotToken() {
        const apiKey = this.config.getMoonrakerApiKey()
        const url = this.config.getMoonrakerUrl()

        if (apiKey === '') { return '' }

        logger.logRegular('Retrieve Oneshot Token...')

        const response = await axios
            .get(`${url}/access/oneshot_token`, {
                headers: {
                    'X-Api-Key': apiKey
                }
            })

        return response.data.result
    }
}