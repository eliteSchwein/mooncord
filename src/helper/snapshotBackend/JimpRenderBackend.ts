import BaseRenderBackend from "./BaseRenderBackend";
import {Jimp, JimpMime} from "jimp";

export default class JimpRenderBackend extends BaseRenderBackend {
    async handleRender() {
        const image = await Jimp.read(this.buffer)

        if(this.pictureConfig) {
            image.rotate(this.pictureConfig.rotation)

            if (this.pictureConfig.flip_vertical) {
                image.flip({vertical: true})
            }
            if (this.pictureConfig.flip_horizontal) {
                image.flip({horizontal: true})
            }

            if (this.pictureConfig.flip_horizontal &&
                this.pictureConfig.flip_vertical && this.
                    pictureConfig.rotation === 0) {
                image.rotate(180)
                image.flip({horizontal: false, vertical: false})
            }
        }

        return image.getBuffer(JimpMime.png);
    }
}