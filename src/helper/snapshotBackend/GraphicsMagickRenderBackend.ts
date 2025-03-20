import BaseRenderBackend from "./BaseRenderBackend";
import m from "gm";
import {waitUntil} from "async-wait-until";

export default class GraphicsMagickRenderBackend extends BaseRenderBackend {
    protected convertedBuffer: Buffer|undefined = undefined;

    async handleRender() {
        const image = m(this.buffer)

        if(this.pictureConfig) {
            image.rotate('black', this.pictureConfig.rotation)

            if (this.pictureConfig.flip_vertical) {
                image.flip()
            }
            if (this.pictureConfig.flip_horizontal) {
                image.flop()
            }
        }

        image.toBuffer('PNG', (err, buffer) => {
            if (err) throw err

            this.convertedBuffer = buffer
        })

        await waitUntil(() => this.convertedBuffer !== undefined)

        return this.convertedBuffer;
    }
}