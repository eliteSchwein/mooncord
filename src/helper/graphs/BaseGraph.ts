import { AttachmentBuilder } from "discord.js";
import { ConfigHelper } from "../ConfigHelper";
import { logRegular } from "../LoggerHelper";
import NoneRenderBackend from "../snapshotBackend/NoneRenderBackend";
import SharpRenderBackend from "../snapshotBackend/SharpRenderBackend";
import {Resvg, ResvgRenderOptions} from "@resvg/resvg-js";
import path from "path";

export default class BaseGraph {
    filename: string;
    config = new ConfigHelper();
    generalConfig = this.config.getConfig().general;

    protected async convertSvg(svg: string): Promise<AttachmentBuilder> {
        let editBuffer: Buffer;

        switch (this.generalConfig.graph_render_backend) {
            case "none":
                logRegular('The none backend is active, the graph will be replaced with an empty pixel...');

                editBuffer = await new NoneRenderBackend(Buffer.from('placeholder', 'utf8')).render();
                break
            case "resvg":
                const opts: ResvgRenderOptions = {
                    background: 'rgba(0,0,0,0)',
                    font: {
                        fontDirs: [path.resolve(__dirname, '../assets/fonts/')],
                        defaultFontSize: 40,
                        loadSystemFonts: false,
                        defaultFontFamily: 'Arial',
                    },
                }

                const resvg = new Resvg(svg, opts)
                const pngData = resvg.render()
                editBuffer = pngData.asPng()
                break
            default:
                editBuffer = await new SharpRenderBackend(Buffer.from(svg, 'utf-8')).render();
        }

        return new AttachmentBuilder(editBuffer, { name: this.filename });
    }
}
