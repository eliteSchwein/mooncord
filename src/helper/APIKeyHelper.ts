import axios from "axios";
import {ConfigHelper} from "./ConfigHelper";

export class APIKeyHelper {
    protected config = new ConfigHelper()

    public async getOneShotToken() {
        const apiKey = this.config.getMoonrakerApiKey()
        const url = this.config.getMoonrakerUrl()

        if (apiKey === '') { return '' }

        const tokenData = await axios
            .get(`${url}/access/oneshot_token`, {
                headers: {
                    'X-Api-Key': apiKey
                }
            })

        return tokenData.data.result
    }
}