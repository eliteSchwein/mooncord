import { getEntry } from "../utils/CacheUtil";
import { formatPercent } from "./FormattingHelper";
import { mergeDeep } from "./ObjectMergeHelper";
import tempMapping from "../meta/temp_mapping.json"

export class TempHelper {
    protected cache = getEntry('state')

    public parseFields() {
        const result = {}
        const supportedSensors = tempMapping.supported_sensors

        for(const sensorType of supportedSensors) {
            mergeDeep(result, this.parseFieldsSet(sensorType))
        }

        return result
    }

    public parseFieldsSet(key: string) {
        const allias = tempMapping.alliases[key]

        if(typeof allias !== 'undefined') { key = allias }

        const cacheData = this.parseCacheFields(key)
        const mappingData = tempMapping[key]
        const fields = {}
        const cacheIds = []

        for(const cacheKey in cacheData) {
            const keyData = {
                name: `${mappingData.key}${cacheKey}`,
                value: ''
            }
            for(const fieldKey in mappingData.fields) {
                const fieldData = mappingData.fields[fieldKey]
                if(typeof cacheData[cacheKey][fieldKey] === 'undefined') {
                    continue
                }
                if(typeof cacheData[cacheKey][fieldKey] === null) {
                    continue
                }
                if(fieldData.suffix === '%') {
                    keyData.value = `${keyData.value}
                        \`${fieldData.label}:\`${formatPercent(cacheData[cacheKey][fieldKey], 0)}${fieldData.suffix}`
                        continue
                }
                keyData.value = `${keyData.value}
                    \`${fieldData.label}:\`${cacheData[cacheKey][fieldKey]}${fieldData.suffix}`
                
            }
            fields[cacheKey] = keyData
            cacheIds.push(cacheData[cacheKey].cache_id)
        }

        return {fields, cacheIds}
    }

    protected parseCacheFields(key) {
        const result = {}

        for(const cacheKey in this.cache) {
            const cacheKeySplit = cacheKey.split(' ')

            if(cacheKeySplit[0] === key) {
                result[key.replace('_', '')] = this.cache[cacheKey]
                result[key.replace('_', '')].cache_id = cacheKey
            }
        }

        return result
    }
}