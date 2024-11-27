import BaseSnapshotBackend from "./BaseSnapshotBackend";
import {Jimp, JimpMime} from "jimp";

export default class JimpSnapshotBackend extends BaseSnapshotBackend {
    async handleRender() {
        const image = await Jimp.read(this.buffer)

        image.rotate(this.webcamData.rotation)

        if (this.webcamData.flip_vertical) {
            image.flip({vertical: true})
        }
        if (this.webcamData.flip_horizontal) {
            image.flip({horizontal: true})
        }

        if (this.webcamData.flip_horizontal &&
            this.webcamData.flip_vertical && this.
            webcamData.rotation === 0) {
            image.rotate(180)
            image.flip({horizontal: false, vertical: false})
        }

        return image.getBuffer(JimpMime.png);
    }
}