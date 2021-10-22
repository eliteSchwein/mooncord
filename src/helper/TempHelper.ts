import { getEntry } from "../utils/CacheUtil";
import { formatPercent } from "./FormattingHelper";
import tempMapping from "../meta/temp_mapping.json"

export class TempHelper {
    protected cache = getEntry('state')

    public parseFields() {
        const result = {
            "fields": [],
            "cache_ids": []
        }
        const supportedSensors = tempMapping.supported_sensors

        for(const sensorType of supportedSensors) {
            const sensorResult = this.parseFieldsSet(sensorType)
            
            if(sensorResult.fields.length > 0) {
                result.fields = result.fields.concat(sensorResult.fields)
                result.cache_ids = result.cache_ids.concat(sensorResult.cache_ids)
            }
        }

        return result
    }

    protected parseFieldTitle(key: string) {
        const hideList = tempMapping.hide_types

        hideList.some(hideType => key = key.replace(hideType, ''))

        return key
    }

    public parseFieldsSet(key: string) {
        const allias = tempMapping.alliases[key]

        const cacheData = this.parseCacheFields(key)

        if(typeof allias !== 'undefined') { key = allias }

        const mappingData = tempMapping[key]
        const fields = []
        const cacheIds = []

        for(const cacheKey in cacheData) {
            const keyData = {
                name: `${mappingData.icon} ${this.parseFieldTitle(cacheKey)}`,
                value: '',
                inline: true
            }
            for(const fieldKey in mappingData.fields) {
                const fieldData = mappingData.fields[fieldKey]
                if(typeof cacheData[cacheKey][fieldKey] === 'undefined') {
                    continue
                }
                if(cacheData[cacheKey][fieldKey] === null) {
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
            fields.push(keyData)
            cacheIds.push(cacheData[cacheKey])
        }

        return {fields: fields, cache_ids: cacheIds}
    }

    protected parseCacheFields(key) {
        const result = {}

        for(const cacheKey in this.cache) {
            const cacheKeySplit = cacheKey.split(' ')

            if(cacheKeySplit[0] === key) {
                result[cacheKey] = this.cache[cacheKey]
            }
        }

        return result
    }
}