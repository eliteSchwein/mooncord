const si = require('systeminformation')

module.exports = {}
module.exports.getTitle = () => { return 'CPU' }
module.exports.getFields = async () => {
    const cpu = await si.cpu()
    const load = await si.currentLoad()
    const cpuTemp = await si.cpuTemperature()
    const cpuFreq = await si.cpuCurrentSpeed()
    
    const fields = [{
        name: 'Model',
        value: cpu.brand,
        inline: true
    },{
        name: 'Manufacturer',
        value: cpu.brand,
        inline: true
    },{
        name: 'Usage',
        value: `${load.currentLoad.toFixed(2)}%`,
        inline: true
    },{
        name: 'Cores',
        value: `${cpu.physicalCores}`,
        inline: true
    },{
        name: 'Threads',
        value: ` ${cpu.cores}`,
        inline: true
    },{
        name: 'Temp',
        value: `${cpuTemp.main.toFixed(2)}°C`,
        inline: true
    },{
        name: 'Freq',
        value: `${cpuFreq.avg}GHz`,
        inline: true
    },{
        name: 'Max Freq',
        value: `${cpuFreq.max}GHz`,
        inline: true
    }]
    
    return fields
}