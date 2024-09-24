'use strict'

import {Message, User} from "discord.js";
import {getEntry} from "../../../../utils/CacheUtil";
import BaseHandler from "../abstracts/BaseHandler";

export class CameraSettingHandler extends BaseHandler {
    async isValid(message: Message, user: User, data, interaction = null) {
        return !(!data.functions.includes("camera_mirror_horizontal") &&
            !data.functions.includes("camera_mirror_vertical") &&
            !data.functions.includes("camera_rotate"));
    }

    async handleHandler(message: Message, user: User, data, interaction = null) {
        const cache = getEntry('webcam')
        const webcamData = cache.entries[cache.active]

        if(data.functions.includes("camera_mirror_horizontal")) {
            webcamData.flip_horizontal = !webcamData.flip_horizontal
        }

        if(data.functions.includes("camera_mirror_vertical")) {
            webcamData.flip_vertical = !webcamData.flip_vertical
        }

        if(data.functions.includes("camera_rotate")) {
            webcamData.rotation += 90

            if(webcamData.rotation === 360) {
                webcamData.rotation = 0
            }
        }

        await this.moonrakerClient.send({"method": "server.webcams.post_item","params": webcamData})
    }
}