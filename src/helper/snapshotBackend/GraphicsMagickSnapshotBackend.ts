import BaseSnapshotBackend from "./BaseSnapshotBackend";
import m from "gm";
import {waitUntil} from "async-wait-until";

export default class GraphicsMagickSnapshotBackend extends BaseSnapshotBackend {
    protected convertedBuffer: Buffer|undefined = undefined;
    protected useImageMagick: boolean = false;

    public constructor(
        buffer: Buffer,
        webcamData: any,
        useImageMagick: boolean = false,
    ) {
        super(buffer, webcamData)

        this.useImageMagick = useImageMagick
    }

    async handleRender() {
        const image = m(this.buffer)
            .rotate('black', this.webcamData.rotation)

        if(this.useImageMagick) {
            m.subClass({
                imageMagick: this.useImageMagick
            })
        }

        if (this.webcamData.flip_vertical) {
            image.flip()
        }
        if (this.webcamData.flip_horizontal) {
            image.flop()
        }

        image.toBuffer('PNG', (err, buffer) => {
            if (err) throw err

            this.convertedBuffer = buffer
        })

        await waitUntil(() => this.convertedBuffer !== undefined)

        return this.convertedBuffer;
    }
}