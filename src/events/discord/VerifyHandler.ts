import {Client} from "discord.js";
import {logError, logRegular, logSuccess} from "../../helper/LoggerHelper";
import {getEntry} from "../../utils/CacheUtil";
import {getDatabase} from "../../Application";

export class VerifyHandler {
    protected tmpController = getEntry('tmp_controller')

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) {
                return
            }
            if (typeof this.tmpController === 'undefined') {
                return
            }

            if (message.author.tag !== this.tmpController) {
                logError(`${message.author.tag} is not matching the Controller Tag ${this.tmpController}!!!`)
                return
            }

            const controllerId = message.author.id

            const controllers = getDatabase().getDatabaseEntry('permissions')['controllers']

            if (controllers.includes(controllerId)) {
                logError(`${message.author.tag} is already a Controller!!!`)
                await message.reply('You are already a Controller')
                return
            }

            logRegular(`add ${message.author.tag}'s ID into the Controller List (${controllerId})...`)
            controllers.push(controllerId)

            await message.reply('You have now the Controller Permission over me')

            logSuccess('stopping MoonCord...')

            process.exit(0)
        })
    }
}