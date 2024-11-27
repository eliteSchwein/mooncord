import {ConfigHelper} from "../ConfigHelper";

export default class BaseSnapshotBackend {
    protected buffer: Buffer
    protected webcamData: any
    protected config: ConfigHelper

    public constructor(
        buffer: Buffer,
        webcamData: any
    ) {
        this.buffer = buffer
        this.webcamData = webcamData
    }

    public async render() {
        return await this.handleRender()
    }

    async handleRender(): Promise<Buffer> {
        return this.buffer
    }
}