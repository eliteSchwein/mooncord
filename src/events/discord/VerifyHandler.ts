'use strict'

import {Client} from "discord.js";
import {logError, logRegular} from "../../helper/LoggerHelper";
import {getEntry, setData} from "../../utils/CacheUtil";
import {getDatabase} from "../../Application";
import {EmbedHelper} from "../../helper/EmbedHelper";

export class VerifyHandler {
    protected database = getDatabase()
    protected embedHelper = new EmbedHelper()

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) {
                return
            }

            const setupCode = getEntry('setup_code')

            if (typeof setupCode === 'undefined') {
                return
            }

            const content = message.content.trim()

            if(content === '') {
                console.log(message)
                return
            }

            if(content !== setupCode) {
                logError(`Message (${content}) doesnt match the setup code: ${setupCode}!!!`)
                return
            }

            const controllerId = message.author.id

            const permissions = this.database.getDatabaseEntry('permissions')

            if (permissions['controllers'].includes(controllerId)) {
                logError(`${message.author.tag} is already a Controller!!!`)
                await message.reply('You are already a Controller')
                //return
            } else {
                logRegular(`add ${message.author.tag}'s ID into the Controller List (${controllerId})...`)
                permissions['controllers'].push(controllerId)

                setData('setup_code', undefined)

                await this.database.updateDatabaseEntry('permissions', permissions)

                await message.reply('You have now the Controller Permission over me')
            }

            setData('tmp_controller', undefined)

            const setupMessage = await this.embedHelper.generateEmbed('setup_1')

            await message.channel.send(setupMessage.embed)
        })
    }
}