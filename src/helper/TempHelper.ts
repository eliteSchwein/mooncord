import {findValue, getEntry, setData, updateData} from "../utils/CacheUtil";
import {formatPercent} from "./DataHelper";
import {ConfigHelper} from "./ConfigHelper";
import {logRegular} from "./LoggerHelper";
import * as App from "../Application"
import {LocaleHelper} from "./LocaleHelper";
import {NotificationHelper} from "./NotificationHelper";
import * as temp_meta from "../meta/temp_meta.json"
import TempHistoryGraph from "./graphs/TempHistoryGraph";

export class TempHelper {
    protected cache = getEntry('state')
    protected configHelper = new ConfigHelper()
    protected localeHelper = new LocaleHelper()
    protected tempHistoryGraph = new TempHistoryGraph()
    protected colors = this.tempHistoryGraph.getColors()
    protected locale = this.localeHelper.getLocale()
    protected tempCache = getEntry('temps')
    protected functionCache = getEntry('function')
    protected notificationHelper = new NotificationHelper()
    protected colorIndex = 0
    protected tempMeta = temp_meta

    public generateColors(cache: any) {
        this.cache = cache
        logRegular("Generate Sensor Colors...")

        const colorCache = {}
        const temperatureSensors = this.tempMeta.temperature_sensors

        for (const cacheKey in this.cache) {
            const cacheKeySplit = cacheKey.split(' ')
            const keySearch = cacheKeySplit[0].replace(/\d/g, '')

            if (!temperatureSensors.includes(keySearch)) {
                continue
            }

            colorCache[cacheKey] = {
                icon: this.colors[this.colorIndex].icon,
                color: this.colors[this.colorIndex].color
            }

            this.colorIndex++

            if (this.colorIndex === this.colors.length) {
                this.colorIndex = 0
            }
        }

        updateData('temps', {
            'colors': colorCache
        })
    }

    public parseFields(minimal = false) {
        const result = {
            "fields": [],
            "cache_ids": []
        }
        let supportedSensors = this.tempMeta.supported_sensors

        if (minimal) {
            supportedSensors = this.tempMeta.minimal_supported_sensors
        }

        for (const sensorType of supportedSensors) {
            const sensorResult = this.parseFieldsSet(sensorType, minimal)

            if (sensorResult.fields.length > 0) {
                result.fields = result.fields.concat(sensorResult.fields)
                result.cache_ids = result.cache_ids.concat(sensorResult.cache_ids)
            }
        }

        return result
    }

    public isCold(temperature: number) {
        return temperature < this.tempMeta.cold_meta.hot_temp
    }

    public isSlowFan(speed: number) {
        return speed < (this.tempMeta.slow_fan_meta.fast_fan / 100)
    }

    public parseFieldsSet(key: string, hideColor = false) {
        const allias = this.tempMeta.alliases[key]

        const cacheData = this.parseCacheFields(key)

        if (typeof allias !== 'undefined') {
            key = allias
        }

        const mappingData = this.tempMeta[key]
        const fields = []
        const cacheIds = []

        for (const cacheKey in cacheData) {
            const title = this.parseFieldTitle(cacheKey)

            const keyData = {
                name: `${mappingData.icon} ${title}`,
                value: '',
                inline: true
            }

            if (typeof cacheData[cacheKey].temperature !== 'undefined' &&
                this.tempMeta.temperature_sensors.includes(key) &&
                !hideColor) {

                mappingData.fields.color = {
                    label: '${embeds.fields.color}',
                    icon: this.tempCache.colors[cacheKey].icon
                }
            }

            if (typeof cacheData[cacheKey].temperature !== 'undefined' &&
                this.tempMeta.heater_types.includes(key)) {
                if (this.isCold(cacheData[cacheKey].temperature)) {
                    keyData.name = `${this.tempMeta.cold_meta.icon} ${this.parseFieldTitle(cacheKey)}`
                }
            }

            if (typeof cacheData[cacheKey].speed !== 'undefined' &&
                this.tempMeta.fan_types.includes(key)) {
                if (this.isSlowFan(cacheData[cacheKey].speed)) {
                    keyData.name = `${this.tempMeta.slow_fan_meta.icon} ${this.parseFieldTitle(cacheKey)}`
                }
            }

            for (const fieldKey in mappingData.fields) {
                const fieldData = mappingData.fields[fieldKey]

                if (fieldKey === 'color' && !hideColor) {
                    keyData.value = `${keyData.value}\n\`${fieldData.label}\` ${fieldData.icon}`
                    continue
                }

                if (typeof cacheData[cacheKey][fieldKey] === 'undefined') {
                    continue
                }

                if (cacheData[cacheKey][fieldKey] === null) {
                    continue
                }

                if (fieldData.suffix === '%') {
                    keyData.value = `${keyData.value}\n\`${fieldData.label}\` ${formatPercent(cacheData[cacheKey][fieldKey], 0)}${fieldData.suffix}`
                    continue
                }

                if (fieldData.suffix === 'rpm') {
                    keyData.value = `${keyData.value}\n\`${fieldData.label}\` ${cacheData[cacheKey][fieldKey].toFixed(0)}${fieldData.suffix}`
                    continue
                }

                keyData.value = `${keyData.value}\n\`${fieldData.label}\` ${cacheData[cacheKey][fieldKey]}${fieldData.suffix}`

            }

            fields.push(keyData)
            cacheIds.push(cacheData[cacheKey])
        }

        return {fields: fields, cache_ids: cacheIds}
    }

    public getHeaterTarget(heater: string) {
        return this.cache[heater].target
    }

    public getHeaterTemp(heater: string) {
        return this.cache[heater].temperature
    }

    public getHeaterConfigData(heater: string) {
        const rawSearch = findValue(`state.configfile.config.${heater}`)

        if (rawSearch !== undefined && rawSearch !== null) {
            return rawSearch
        }

        return findValue(`state.configfile.config.heater_generic ${heater}`)
    }

    public getHeaterConfigName(heater: string) {
        const rawSearch = findValue(`state.configfile.config.${heater}`)

        if (rawSearch !== undefined && rawSearch !== null) {
            return heater
        }

        return `heater_generic ${heater}`
    }

    public async setHeaterTemp(heater: string, heaterTemp: number) {
        const heaterData = findValue(`state.configfile.config.${heater}`)
        const heaterMaxTemp = Number(heaterData.max_temp)
        const heaterMinTemp = Number(heaterData.min_temp)

        if (heaterTemp === null) {
            return false
        }

        if (heaterTemp > heaterMaxTemp) {
            return this.locale.messages.errors.preheat_over_max
                .replace(/(\${max_temp})/g, heaterMaxTemp)
                .replace(/(\${temp})/g, heaterTemp)
        }

        if (heaterTemp < heaterMinTemp) {
            return this.locale.messages.errors.preheat_below_min
                .replace(/(\${min_temp})/g, heaterMinTemp)
                .replace(/(\${temp})/g, heaterTemp)
        }
        await this.heatHeater(heater, heaterTemp)

        return true
    }

    public async heatHeater(heater: string, temp: number) {
        logRegular(`set Temperatur of ${heater} to ${temp}C°...`)
        await App.getMoonrakerClient().send({
            "method": "printer.gcode.script",
            "params": {"script": `SET_HEATER_TEMPERATURE HEATER=${heater} TARGET=${temp}`}
        })
    }

    public getHeaters() {
        return this.cache.heaters.available_heaters
    }

    public updateHeaterTargets() {
        if (this.cache === undefined) {
            return
        }

        const config = this.configHelper.getTempTargetNotificationConfig()

        if (!config.enable) {
            return
        }

        const tempTargets = this.functionCache.temp_targets

        const heaters = this.getHeaters()

        for (const heater of heaters) {
            const target = this.getHeaterTarget(heater)
            const temp = this.getHeaterTemp(heater)

            const current = tempTargets[heater]

            if (current !== undefined) {
                current.temp = temp

                tempTargets[heater] = current
            }

            if (current !== undefined && target === 0) {
                delete tempTargets[heater]
            }

            if (current === undefined && target > 0 ||
                current !== undefined && target !== current.target) {
                tempTargets[heater] = {
                    temp,
                    target,
                    offset: config.temp_offset,
                    duration: config.temp_duration,
                    delay: config.delay,
                    sended: false
                }
            }
        }

        this.functionCache.temp_targets = tempTargets

        setData('function', this.functionCache)
    }

    public async notifyHeaterTargetNotifications() {
        this.functionCache = getEntry('function')

        const tempTargets = this.functionCache.temp_targets

        const config = this.configHelper.getTempTargetNotificationConfig()

        this.localeHelper = new LocaleHelper()
        this.locale = this.localeHelper.getLocale()

        this.notificationHelper = new NotificationHelper()

        if (!config.enable) {
            return
        }

        if (Object.keys(tempTargets).length === 0) {
            return
        }

        for (const heater in tempTargets) {
            const heaterData = tempTargets[heater]

            const minTemp = heaterData.target - heaterData.offset
            const maxTemp = heaterData.target + heaterData.offset

            if (heaterData.temp > minTemp && heaterData.temp < maxTemp && heaterData.duration !== 0) {
                tempTargets[heater].duration--
                continue
            } else if (heaterData.duration !== 0 && heaterData.delay === config.delay) {
                tempTargets[heater].duration = config.temp_duration
                continue
            }

            if (heaterData.delay === 0 && !heaterData.sended) {
                tempTargets[heater].sended = true

                const message = this.locale.messages.answers.temp_target_reached
                    .replace(/(\${heater})/g, heater)
                    .replace(/(\${target})/g, heaterData.target)

                void this.notificationHelper.broadcastMessage(message)
                continue
            }

            tempTargets[heater].delay--
        }

        this.functionCache.temp_targets = tempTargets

        setData('function', this.functionCache)
    }

    protected parseFieldTitle(key: string) {
        const hideList = this.tempMeta.hide_types

        hideList.some(hideType => key = key.replace(hideType, ''))

        if (key.startsWith(' ')) {
            key = key.substring(1)
        }

        return key
    }

    protected parseCacheFields(key) {
        const result = {}

        for (const cacheKey in this.cache) {
            const cacheKeySplit = cacheKey.split(' ')
            const keySearch = cacheKeySplit[0].replace(/\d/g, '')

            if (keySearch === key) {
                result[cacheKey] = this.cache[cacheKey]
            }
        }

        return result
    }
}