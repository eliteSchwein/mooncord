import {Client} from "discord.js";
import {logError, logRegular, logSuccess} from "../../helper/LoggerHelper";
import {getEntry} from "../../utils/CacheUtil";
import {getDatabase} from "../../Application";

export class VerifyHandler {
    protected database = getDatabase()

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) {
                return
            }

            const tmpController = getEntry('tmp_controller')

            if (typeof tmpController === 'undefined') {
                return
            }

            if (message.author.tag !== tmpController) {
                logError(`${message.author.tag} is not matching the Controller Tag ${tmpController}!!!`)
                return
            }

            const controllerId = message.author.id

            const permissions = this.database.getDatabaseEntry('permissions')

            if (permissions['controllers'].includes(controllerId)) {
                logError(`${message.author.tag} is already a Controller!!!`)
                await message.reply('You are already a Controller')
                return
            }

            logRegular(`add ${message.author.tag}'s ID into the Controller List (${controllerId})...`)
            permissions['controllers'].push(controllerId)

            this.database.updateDatabaseEntry('permissions', permissions)

            await message.reply('You have now the Controller Permission over me')

            logSuccess('stopping MoonCord...')

            process.exit(0)
        })
    }
}