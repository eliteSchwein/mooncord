import axios from 'axios';
import {ConfigHelper} from './ConfigHelper';

export class APIKeyHelper {
    protected config = new ConfigHelper()

    public getOneShotToken() {
        const apiKey = this.config.getMoonrakerApiKey()
        const url = this.config.getMoonrakerUrl()

        if (apiKey === '') { return '' }

        return axios
            .get(`${url}/access/oneshot_token`, {
                headers: {
                    'X-Api-Key': apiKey
                }
            })
            .then((response) => {
                return response.data.result
            });
    }
}