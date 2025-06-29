import {findValue, updateData} from "../utils/CacheUtil";
import {existsSync, mkdirSync, readFileSync} from "fs";
import path from "path";
import {logRegular} from "./LoggerHelper";
import * as os from "node:os";
import {createHash} from "node:crypto";
import {writeFileSync} from "node:fs";

export class ImageHelper {
    public parseImage(imagePath: string): string {
        const tmpPath = `${os.tmpdir()}/mooncordImages`

        if (!existsSync(tmpPath)) {
            mkdirSync(tmpPath, { recursive: true });
        }

        const imageHash = createHash('md5').update(imagePath).digest('hex')
        const tmpImagePath = `${tmpPath}/${imageHash}`

        if (existsSync(tmpImagePath)) {
            return readFileSync(tmpImagePath, 'utf-8');
        }

        logRegular(`convert ${imagePath} to base64`)

        const rawImage = readFileSync(path.resolve(__dirname, `../assets/${imagePath}`))
        const image = `data:image/png;base64,${rawImage.toString("base64")}`

        writeFileSync(tmpImagePath, image)

        return image
    }
}