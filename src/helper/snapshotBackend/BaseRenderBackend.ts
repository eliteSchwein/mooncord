import {ConfigHelper} from "../ConfigHelper";

export default class BaseRenderBackend {
    protected buffer: Buffer
    protected pictureConfig: any
    protected config: ConfigHelper

    public constructor(
        buffer: Buffer,
        pictureConfig: any = undefined,
    ) {
        this.buffer = buffer
        this.pictureConfig = pictureConfig
    }

    public async render() {
        return await this.handleRender()
    }

    async handleRender(): Promise<Buffer> {
        return this.buffer
    }
}