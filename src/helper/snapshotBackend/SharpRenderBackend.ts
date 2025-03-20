import BaseRenderBackend from "./BaseRenderBackend";
import sharp from "sharp";

export default class SharpRenderBackend extends BaseRenderBackend {
    async handleRender() {
        const image = sharp(this.buffer)

        if(this.pictureConfig) {
            image
                .rotate(this.pictureConfig.rotation)
                .flip(this.pictureConfig.flip_vertical)
                .flop(this.pictureConfig.flip_horizontal)

            if (this.pictureConfig.flip_horizontal &&
                this.pictureConfig.flip_vertical &&
                this.pictureConfig.rotation === 0) {
                image
                    .rotate(180)
                    .flip(false)
                    .flop(false)
            }
        }

        image.png({
            quality: 80
        })

        return await image.toBuffer()
    }
}