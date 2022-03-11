import {Client} from "discord.js";
import {getMoonrakerClient} from "../../Application";
import axios from "axios";
import FormData from "form-data"
import {ConfigHelper} from "../../helper/ConfigHelper";
import {LocaleHelper} from "../../helper/LocaleHelper";
import {logError, logRegular, logSuccess, logWarn} from "../../helper/LoggerHelper";
import {PermissionHelper} from "../../helper/PermissionHelper";

export class VerifyHandler {
    protected configHelper = new ConfigHelper()
    protected userConfig = this.configHelper.getUserConfig()

    public constructor(discordClient: Client) {
        discordClient.on("messageCreate", async message => {
            if (message.author.id === discordClient.user.id) { return }
            if(typeof this.userConfig.tmp === 'undefined') { return }
            if(typeof this.userConfig.tmp.controller_tag === 'undefined') { return }

            const controllerTag = this.userConfig.tmp.controller_tag

            if(message.author.tag !== controllerTag) {
                logError(`${message.author.tag} is not matching the Controller Tag ${controllerTag}!!!`)
                return
            }

            const controllerId = message.author.id

            if(this.userConfig.permission.controllers.users === controllerId ||
                this.userConfig.permission.controllers.users.includes(controllerId)) {
                logError(`${message.author.tag} is already a Controller!!!`)
                await message.reply('You are already a Controller')
                this.writeConfig()
                return
            }

            if(this.userConfig.permission.controllers.users === '') {
                logRegular(`write ${message.author.tag}'s ID as Controller (${controllerId})...`)
                this.userConfig.permission.controllers.users = controllerId
            } else {
                logRegular(`add ${message.author.tag}'s ID into the Controller List (${controllerId})...`)
                const oldControllerId = this.userConfig.permission.controllers.users
                this.userConfig.permission.controllers.users = [oldControllerId]
                this.userConfig.permission.controllers.users.push(controllerId)
            }

            await message.reply('You have now the Controller Permission over me')

            this.writeConfig()
        })
    }

    private writeConfig() {
        delete this.userConfig.tmp

        logRegular('writing User Config...')

        this.configHelper.writeUserConfig(this.userConfig)

        logSuccess('stopping MoonCord...')

        process.exit(0)
    }
}