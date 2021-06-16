const si = require('systeminformation')
const locale = require('../localeUtil')

module.exports = {}
module.exports.getTitle = () => { return locale.loadinfo.ram.title }
module.exports.getFields = async () => {
    const ram = await si.mem()
    
    return [{
        name: locale.loadinfo.ram.total,
        value:`${(ram.total / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: locale.loadinfo.ram.used,
        value:`${(ram.used / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: locale.loadinfo.ram.swap,
        value:`${(ram.swaptotal / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: locale.loadinfo.ram.swap_used,
        value:`${(ram.swapused / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    }]
}