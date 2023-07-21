'use strict'

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
    public generateColors() {
        const cache = getEntry('state')
        logRegular("Generate Sensor Colors...")

        const colorCache = {}
        const temperatureSensors = temp_meta.temperature_sensors
        const colors = new TempHistoryGraph().getColors()
        let  colorIndex = 0

        for (const cacheKey in cache) {
            const cacheKeySplit = cacheKey.split(' ')
            const keySearch = cacheKeySplit[0].replace(/\d/g, '')

            if (!temperatureSensors.includes(keySearch)) {
                continue
            }

            colorCache[cacheKey] = {
                icon: colors[colorIndex].icon,
                color: colors[colorIndex].color
            }

            colorIndex++

            if (colorIndex === colors.length) {
                colorIndex = 0
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
        let supportedSensors = temp_meta.supported_sensors

        if (minimal) {
            supportedSensors = temp_meta.minimal_supported_sensors
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
        return temperature < temp_meta.cold_meta.hot_temp
    }

    public isSlowFan(speed: number) {
        return speed < (temp_meta.slow_fan_meta.fast_fan / 100)
    }

    public parseFieldsSet(key: string, hideColor = false) {
        const allias = temp_meta.alliases[key]

        const cacheData = this.parseCacheFields(key)
        const configHelper = new ConfigHelper()

        if (typeof allias !== 'undefined') {
            key = allias
        }

        const mappingData = temp_meta[key]
        const fields = []
        const cacheIds = []

        for (const cacheKey in cacheData) {
            const title = this.parseFieldTitle(cacheKey)
            let icon = configHelper.getIcons(new RegExp(`${mappingData.icon}`, 'g'))[0].icon

            const keyData = {
                name: `${icon} ${title}`,
                value: '',
                inline: true
            }

            if (typeof cacheData[cacheKey].temperature !== 'undefined' &&
                temp_meta.temperature_sensors.includes(key) &&
                !hideColor) {

                mappingData.fields.color = {
                    label: '${embeds.fields.color}',
                    icon: getEntry('temps').colors[cacheKey].icon
                }
            }

            if (typeof cacheData[cacheKey].temperature !== 'undefined' &&
                temp_meta.heater_types.includes(key)) {
                if (this.isCold(cacheData[cacheKey].temperature)) {
                    icon = configHelper.getIcons(new RegExp(`${temp_meta.cold_meta.icon}`, 'g'))[0].icon
                    keyData.name = `${icon} ${this.parseFieldTitle(cacheKey)}`
                }
            }

            if (typeof cacheData[cacheKey].speed !== 'undefined' &&
                temp_meta.fan_types.includes(key)) {
                if (this.isSlowFan(cacheData[cacheKey].speed)) {
                    icon = configHelper.getIcons(new RegExp(`${temp_meta.slow_fan_meta.icon}`, 'g'))[0].icon
                    keyData.name = `${icon} ${this.parseFieldTitle(cacheKey)}`
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
        return getEntry('state')[heater].target
    }

    public getHeaterTemp(heater: string) {
        return getEntry('state')[heater].temperature
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
        const locale = new LocaleHelper().getLocale()

        if (heaterTemp === null) {
            return false
        }

        if (heaterTemp > heaterMaxTemp) {
            return locale.messages.errors.preheat_over_max
                .replace(/(\${max_temp})/g, heaterMaxTemp)
                .replace(/(\${temp})/g, heaterTemp)
        }

        if (heaterTemp < heaterMinTemp) {
            return locale.getLocale().messages.errors.preheat_below_min
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
        return getEntry('state').heaters.available_heaters
    }

    public updateHeaterTargets() {
        const cache = getEntry('state')

        if (cache === undefined) {
            return
        }

        const configHelper = new ConfigHelper()
        const functionCache = getEntry('function')

        const config = configHelper.getConfig().notifications

        if (!config.temp_notifications) {
            return
        }

        const tempTargets = functionCache.temp_targets

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
                    offset: config.temp_notification_offset,
                    duration: config.temp_notification_duration,
                    delay: config.temp_notification_delay,
                    sended: false
                }
            }
        }

        functionCache.temp_targets = tempTargets

        setData('function', functionCache)
    }

    public async notifyHeaterTargetNotifications() {
        const functionCache = getEntry('function')

        const tempTargets = functionCache.temp_targets

        const config = new ConfigHelper().getConfig().notifications
        const locale = new LocaleHelper().getLocale()

        if (!config.temp_notifications) {
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
            } else if (heaterData.duration !== 0 && heaterData.delay === config.temp_notification_delay) {
                tempTargets[heater].duration = config.temp_notification_duration
                continue
            }

            if (heaterData.delay === 0 && !heaterData.sended) {
                tempTargets[heater].sended = true

                const message = locale.messages.answers.temp_target_reached
                    .replace(/(\${heater})/g, heater)
                    .replace(/(\${target})/g, heaterData.target)

                void new NotificationHelper().broadcastMessage(message)
                continue
            }

            tempTargets[heater].delay--
        }

        functionCache.temp_targets = tempTargets

        setData('function', functionCache)
    }

    private parseFieldTitle(key: string) {
        const hideList = temp_meta.hide_types

        hideList.some(hideType => key = key.replace(hideType, ''))

        if (key.startsWith(' ')) {
            key = key.substring(1)
        }

        return key
    }

    private parseCacheFields(key) {
        const result = {}
        const cache = getEntry('state')

        for (const cacheKey in cache) {
            const cacheKeySplit = cacheKey.split(' ')
            const keySearch = cacheKeySplit[0].replace(/\d/g, '')

            if (keySearch === key) {
                result[cacheKey] = cache[cacheKey]
            }
        }

        return result
    }
}