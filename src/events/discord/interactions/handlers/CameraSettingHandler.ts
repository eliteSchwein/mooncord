import {Message, MessageEmbed, User} from "discord.js";
import {getMoonrakerClient} from "../../../../Application";
import {LocaleHelper} from "../../../../helper/LocaleHelper";
import {EmbedHelper} from "../../../../helper/EmbedHelper";
import {ConfigHelper} from "../../../../helper/ConfigHelper";
import {setData} from "../../../../utils/CacheUtil";
import {readFileSync, writeFileSync} from "fs";

export class CameraSettingHandler {
    protected moonrakerClient = getMoonrakerClient()
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()
    protected embedHelper = new EmbedHelper()
    protected configHelper = new ConfigHelper()

    public async execute(message: Message, user: User, data, interaction = null) {
        if (!data.functions.includes("camera_mirror_horizontal") &&
            !data.functions.includes("camera_mirror_vertical") &&
            !data.functions.includes("camera_brightness_down") &&
            !data.functions.includes("camera_brightness_up") &&
            !data.functions.includes("camera_rotate")) {
            return
        }

        const webcamData = this.configHelper.getEntriesByFilter(/^webcam$/g)[0]['default']
        const config = this.configHelper.getConfig()

        let rawUserConfig = readFileSync(`${this.configHelper.getUserConfigPath()}/mooncord.cfg`, {encoding: "utf-8"})

        if(data.functions.includes("camera_mirror_horizontal")) {
            webcamData.horizontal_mirror = !webcamData.horizontal_mirror

            rawUserConfig = rawUserConfig.replace(/horizontal_mirror: (true|false)/g, `horizontal_mirror: ${webcamData.horizontal_mirror}`)
        }

        if(data.functions.includes("camera_mirror_vertical")) {
            webcamData.vertical_mirror = !webcamData.vertical_mirror

            rawUserConfig = rawUserConfig.replace(/vertical_mirror: (true|false)/g, `vertical_mirror: ${webcamData.vertical_mirror}`)
        }

        if(data.functions.includes("camera_brightness_down")) {
            webcamData.brightness -= 0.2

            rawUserConfig = rawUserConfig.replace(/brightness:\s*.*/g, `brightness: ${webcamData.brightness}`)
        }

        if(data.functions.includes("camera_brightness_up")) {
            webcamData.brightness += 0.2

            rawUserConfig = rawUserConfig.replace(/brightness:\s*.*/g, `brightness: ${webcamData.brightness}`)
        }

        if(data.functions.includes("camera_rotate")) {
            webcamData.rotate += 90

            if(webcamData.rotate === 360) {
                webcamData.rotate = 0
            }

            rawUserConfig = rawUserConfig.replace(/rotate:\s*.*/g, `rotate: ${webcamData.rotate}`)
        }

        config.webcam.default = webcamData

        setData('config', config)

        writeFileSync(`${this.configHelper.getUserConfigPath()}/mooncord.cfg`, rawUserConfig, {encoding: 'utf8', flag: 'w+'})
    }
}