import {AttachmentBuilder} from "discord.js";
import {ConfigHelper} from "../ConfigHelper";
import {logRegular} from "../LoggerHelper";
import NoneRenderBackend from "../snapshotBackend/NoneRenderBackend";
import JimpRenderBackend from "../snapshotBackend/JimpRenderBackend";
import GraphicsMagickRenderBackend from "../snapshotBackend/GraphicsMagickRenderBackend";
import SharpRenderBackend from "../snapshotBackend/SharpRenderBackend";

export default class BaseGraph {
    filename: string;
    config = new ConfigHelper()
    renderBackend = this.config.getConfig().general.graph_render_backend

    protected async convertSvg(svg: string): Promise<AttachmentBuilder> {
        if(this.renderBackend === 'none') {
            logRegular('the none backend is active, the graph will be replaced with a empty pixel...')

            const editBuffer = await new NoneRenderBackend(Buffer.from('placeholder', 'utf8')).render()

            return new AttachmentBuilder(editBuffer, {name: this.filename})
        }

        const buffer = Buffer.from(svg)

        let editBuffer: Buffer

        switch (this.renderBackend) {
            case 'jimp':
                editBuffer = await new JimpRenderBackend(buffer).render()
                break
            case 'graphicsmagick':
            case 'gm':
                editBuffer = await new GraphicsMagickRenderBackend(
                    buffer)
                    .render()
                break
            default:
                editBuffer = await new SharpRenderBackend(buffer).render()
        }

        buffer.fill(0)

        return new AttachmentBuilder(editBuffer, {name: this.filename})
    }
}