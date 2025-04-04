import {findValue, updateData} from "../utils/CacheUtil";
import {readFileSync} from "fs";
import path from "path";
import {logRegular} from "./LoggerHelper";

export class ImageHelper {
    public purgeCachedImages() {
        const parsedImagesCache = findValue('images.parsed')

        if(Object.keys(parsedImagesCache).length === 0) return

        const currentDate = Date.now() / 1000

        for(const imagePath in parsedImagesCache) {
            const parsedImage = parsedImagesCache[imagePath]
            if(parsedImage.expires_at > currentDate)
                continue

            delete parsedImagesCache[imagePath]
        }

        updateData('images', {parsed: parsedImagesCache})
    }

    public parseImage(imagePath: string): string {
        const parsedImagesCache = findValue('images.parsed')

        const currentDate = Date.now() / 1000
        const newExpireDate = currentDate + 60

        let parsedImage = parsedImagesCache[imagePath]

        if(parsedImage && parsedImage.expires_at > currentDate) {
            parsedImage.expires_at = newExpireDate

            parsedImagesCache[imagePath] = parsedImage

            updateData('images', {parsed: parsedImagesCache})

            return parsedImage.value
        }

        logRegular(`convert ${imagePath} to base64`)

        const rawImage = readFileSync(path.resolve(__dirname, `../assets/${imagePath}`))

        parsedImage = {
            value: `data:image/png;base64,${rawImage.toString("base64")}`,
            expires_at: newExpireDate,
        }

        parsedImagesCache[imagePath] = parsedImage

        updateData('images', {parsed: parsedImagesCache})

        return parsedImage.value
    }
}