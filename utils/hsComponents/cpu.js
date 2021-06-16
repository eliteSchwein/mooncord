const si = require('systeminformation')

const locale = require('../localeUtil')

module.exports = {}
module.exports.getTitle = () => { return locale.loadinfo.cpu.title }
module.exports.getFields = async () => {
    const cpu = await si.cpu()
    const load = await si.currentLoad()
    const cpuTemp = await si.cpuTemperature()
    const cpuFreq = await si.cpuCurrentSpeed()
    
    return [{
        name: locale.loadinfo.cpu.model,
        value: cpu.brand,
        inline: true
    },{
        name: locale.loadinfo.cpu.manufacturer,
        value: cpu.manufacturer,
        inline: true
    },{
        name: locale.loadinfo.cpu.usage,
        value: `${load.currentLoad.toFixed(2)}%`,
        inline: true
    },{
        name: locale.loadinfo.cpu.cores,
        value: `${cpu.physicalCores}`,
        inline: true
    },{
        name: locale.loadinfo.cpu.threads,
        value: ` ${cpu.cores}`,
        inline: true
    },{
        name: locale.loadinfo.cpu.temperature,
        value: `${cpuTemp.main.toFixed(2)}°C`,
        inline: true
    },{
        name: locale.loadinfo.cpu.frequency,
        value: `${cpuFreq.avg}GHz`,
        inline: true
    },{
        name: locale.loadinfo.cpu.max_frequency,
        value: `${cpuFreq.max}GHz`,
        inline: true
    }]
}