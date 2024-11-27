import BaseSnapshotBackend from "./BaseSnapshotBackend";
import {readFile} from "node:fs/promises";
import {resolve} from "path";

export default class NoneSnapshotBackend extends BaseSnapshotBackend {
    async handleRender() {
        return await readFile(resolve(__dirname, `../assets/placeholder.png`))
    }
}