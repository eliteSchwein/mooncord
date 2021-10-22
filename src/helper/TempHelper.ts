import { getEntry } from "../utils/CacheUtil";
import { formatPercent } from "./FormattingHelper";
import { mergeDeep } from "./ObjectMergeHelper";

export class TempHelper {
    protected cache = getEntry('state')

    public parseFields() {
        const result = {}

        mergeDeep(result, this.parseFanFields())
        mergeDeep(result, this.parseExtruderFields())

        return result
    }

    public parseExtruderFields() {
        const cacheData = this.parseCacheFields('extruder')
        const fields = {}
        const cacheIds = []

        for(const key in cacheData) {
            const keyData = {
                name: `♨${key}`,
                value: `📶\`\${embeds.fields.power}:\`${formatPercent(cacheData[key].power, 0)}%
                    🌡\`\${embeds.fields.target}:\`${cacheData[key].target, 0}°C
                    🌡\`\${embeds.fields.current}:\`${cacheData[key].temperature, 0}°C`
            }
            fields[key] = keyData
            cacheIds.push(cacheData[key].cache_id)
        }

        return {fields, cacheIds}
    }

    public parseFanFields() {
        const cacheData = this.parseCacheFields('fan')
        const fields = {}
        const cacheIds = []

        for(const key in cacheData) {
            const keyData = {
                name: `💨${key}`,
                value: `📶\`\${embeds.fields.power}:\`${formatPercent(cacheData[key].speed, 0)}%`
            }
            if(cacheData[key].rpm !== null) {
                keyData.value = `${keyData.value}
                    💿\`\${embeds.fields.speed}:\`${cacheData[key].rpm}rpm`
            }
            fields[key] = keyData
            cacheIds.push(cacheData[key].cache_id)
        }

        return {fields, cacheIds}
    }

    protected parseCacheFields(key) {
        const result = {}

        for(const cacheKey in this.cache) {
            const cacheKeySplit = cacheKey.split(' ')

            if(cacheKeySplit[0] === key) {
                if(typeof cacheKeySplit[1] === undefined) {
                    result[cacheKeySplit[1]] = this.cache[cacheKey]
                    result[cacheKeySplit[1]].cache_id = cacheKey
                } else {
                    result[cacheKeySplit[0]] = this.cache[cacheKey]
                    result[cacheKeySplit[0]].cache_id = cacheKey
                }
            }
        }

        return result
    }
}