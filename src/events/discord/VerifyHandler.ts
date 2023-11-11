'use strict'

import {Client} from "discord.js";
import {logError, logRegular} from "../../helper/LoggerHelper";
import {getEntry, setData} from "../../utils/CacheUtil";
import {getDatabase} from "../../Application";
import {EmbedHelper} from "../../helper/EmbedHelper";

export class VerifyHandler {

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) {
                return
            }

            let setupUser = getEntry('setup_user')

            if (typeof setupUser === 'undefined') {
                return
            }

            const user = message.author.tag
            const controllerId = message.author.id

            const content = message.content.trim()

            if(content === '') {
                return
            }

            if(user !== setupUser) {
                logError(`Message (${user}) doesnt match the setup user: ${setupUser}!!!`)
                return
            }

            const database = getDatabase()
            const embedHelper = new EmbedHelper()

            const permissions = database.getDatabaseEntry('permissions')

            if (permissions['controllers'].includes(controllerId)) {
                logError(`${user} is already a Controller!!!`)
                await message.reply('You are already a Controller')
                //return
            } else {
                logRegular(`add ${user}'s ID into the Controller List (${controllerId})...`)
                permissions['controllers'].push(controllerId)

                setData('setup_code', undefined)

                await database.updateDatabaseEntry('permissions', permissions)

                await message.reply('You have now the Controller Permission over me')
            }

            setData('tmp_controller', undefined)

            const setupMessage = await embedHelper.generateEmbed('setup_1')

            await message.channel.send(setupMessage.embed)
        })
    }
}