import BaseRenderBackend from "./BaseRenderBackend";
import {readFile} from "node:fs/promises";
import {resolve} from "path";

export default class NoneRenderBackend extends BaseRenderBackend {
    async handleRender() {
        return await readFile(resolve(__dirname, `../assets/placeholder.png`))
    }
}