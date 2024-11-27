import BaseSnapshotBackend from "./BaseSnapshotBackend";
import sharp from "sharp";

export default class SharpSnapshotBackend extends BaseSnapshotBackend {
    async handleRender() {
        const image = sharp(this.buffer)

        image
            .rotate(this.webcamData.rotation)
            .flip(this.webcamData.flip_vertical)
            .flop(this.webcamData.flip_horizontal)

        if (this.webcamData.flip_horizontal &&
            this.webcamData.flip_vertical &&
            this.webcamData.rotation === 0) {
            image
                .rotate(180)
                .flip(false)
                .flop(false)
        }

        image.png({
            quality: 80
        })

        return await image.toBuffer()
    }
}